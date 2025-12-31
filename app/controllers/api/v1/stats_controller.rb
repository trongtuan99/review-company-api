class Api::V1::StatsController < ApplicationController
  before_action :authenticate_user!, only: [:admin_stats, :admin_activities]

  # Public endpoint - no authentication required
  def index
    render json: json_with_success(data: {
      total_users: User.where(is_deleted: false).count,
      total_companies: Company.where(is_deleted: false).count,
      total_reviews: Review.approved.where(is_deleted: false).count
    })
  end

  # Admin endpoint - detailed stats with activity
  def admin_stats
    unless current_user.role&.admin? || current_user.role&.owner? || current_user.role&.can?(:read, :dashboard)
      return render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end

    today = Date.today
    this_week = today.beginning_of_week
    this_month = today.beginning_of_month

    render json: json_with_success(data: {
      # Totals
      total_users: User.where(is_deleted: false).count,
      total_companies: Company.where(is_deleted: false).count,
      total_reviews: Review.approved.where(is_deleted: false).count,

      # Today stats
      today: {
        new_users: User.where(is_deleted: false).where("created_at >= ?", today.beginning_of_day).count,
        new_reviews: Review.where(is_deleted: false).where("created_at >= ?", today.beginning_of_day).count,
        new_companies: Company.where(is_deleted: false).where("created_at >= ?", today.beginning_of_day).count
      },

      # This week stats
      this_week: {
        new_users: User.where(is_deleted: false).where("created_at >= ?", this_week).count,
        new_reviews: Review.where(is_deleted: false).where("created_at >= ?", this_week).count,
        new_companies: Company.where(is_deleted: false).where("created_at >= ?", this_week).count
      },

      # This month stats
      this_month: {
        new_users: User.where(is_deleted: false).where("created_at >= ?", this_month).count,
        new_reviews: Review.where(is_deleted: false).where("created_at >= ?", this_month).count,
        new_companies: Company.where(is_deleted: false).where("created_at >= ?", this_month).count
      },

      # Recent activity
      recent_activity: get_recent_activity
    })
  end

  # Admin activities log
  def admin_activities
    unless current_user.role&.admin? || current_user.role&.owner? || current_user.role&.can?(:read, :dashboard)
      return render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end

    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    action_filter = params[:action_type]
    resource_filter = params[:resource_type]

    activities_query = AdminActivity.includes(:user).recent

    # Filter by action
    if action_filter.present? && action_filter != 'all'
      activities_query = activities_query.by_action(action_filter)
    end

    # Filter by resource type
    if resource_filter.present? && resource_filter != 'all'
      activities_query = activities_query.by_resource(resource_filter)
    end

    total_count = activities_query.count
    offset = (page - 1) * per_page
    activities = activities_query.offset(offset).limit(per_page)

    data = activities.map do |activity|
      admin_name = [activity.user.first_name, activity.user.last_name].compact.join(' ').presence || activity.user.email
      {
        id: activity.id,
        action: activity.action,
        resource_type: activity.resource_type,
        resource_id: activity.resource_id,
        resource_name: activity.resource_name,
        message: activity.message,
        icon: activity.icon,
        admin_name: admin_name,
        admin_email: activity.user.email,
        details: activity.details,
        ip_address: activity.ip_address,
        created_at: activity.created_at
      }
    end

    render json: {
      status: 'ok',
      data: data,
      pagination: {
        page: page,
        per_page: per_page,
        total: total_count,
        total_pages: (total_count.to_f / per_page).ceil
      }
    }
  end

  private

  def get_recent_activity
    activities = []

    # Recent users (last 5)
    User.where(is_deleted: false).order(created_at: :desc).limit(5).each do |user|
      display_name = [user.first_name, user.last_name].compact.join(' ').presence || user.email
      activities << {
        type: 'user_registered',
        message: "#{display_name} đã đăng ký",
        time: user.created_at,
        icon: '👤'
      }
    end

    # Recent reviews (last 5)
    Review.where(is_deleted: false).includes(:user, :company).order(created_at: :desc).limit(5).each do |review|
      if review.is_anonymous
        user_name = 'Ẩn danh'
      else
        user_name = [review.user&.first_name, review.user&.last_name].compact.join(' ').presence || 'User'
      end
      company_name = review.company&.name || 'Unknown'
      activities << {
        type: 'review_created',
        message: "#{user_name} đánh giá #{company_name}",
        time: review.created_at,
        icon: '📝'
      }
    end

    # Recent companies (last 3)
    Company.where(is_deleted: false).order(created_at: :desc).limit(3).each do |company|
      activities << {
        type: 'company_added',
        message: "Công ty #{company.name} được thêm",
        time: company.created_at,
        icon: '🏢'
      }
    end

    # Sort by time and return top 10
    activities.sort_by { |a| a[:time] }.reverse.first(10)
  end
end
