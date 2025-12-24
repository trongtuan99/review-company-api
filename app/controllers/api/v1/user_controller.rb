class Api::V1::UserController < ApplicationController
  include AdminTrackable

  around_action :with_transaction, except: %i[update_profile delete_user activity_stats recent_comments my_reviews all stats create update_role show]
  before_action :get_user, only: [:update_profile, :delete_user, :show, :update_role]
  before_action :authenticate_user!, only: [:index, :activity_stats, :recent_comments, :my_reviews, :all, :stats, :delete_user, :create, :update_role, :update_profile, :show]
  before_action :validate_permission, only: [:update_profile, :delete_user]
  before_action :check_admin_role, only: [:all, :stats, :create, :update_role]

  def index
    # For logged-in user to get their own profile
    render json: json_with_success(data: current_user, default_serializer: UserSerializer)
  end

  def show
    render json: json_with_success(data: @user, default_serializer: UserSerializer)
  end

  # Admin: Get all users with pagination
  def all
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10

    users_query = User.where(is_deleted: false)
    total_count = users_query.count

    offset = (page - 1) * per_page
    data = users_query.order(created_at: :desc).offset(offset).limit(per_page)

    response_data = json_with_success(data: data, default_serializer: UserSerializer)
    response_data[:pagination] = {
      page: page,
      per_page: per_page,
      total: total_count,
      total_pages: (total_count.to_f / per_page).ceil
    }

    render json: response_data
  end

  # Admin: Get stats
  def stats
    render json: json_with_success(data: {
      total_users: User.where(is_deleted: false).count,
      total_companies: Company.where(is_deleted: false).count,
      total_reviews: Review.where(is_deleted: false).count
    })
  end

  # Admin: Create new user
  def create
    user = User.new(create_user_params)
    user.role_id = params[:role_id] if params[:role_id].present?
    user.save!
    track_admin_action('create', user)
    render json: json_with_success(data: user, default_serializer: UserSerializer)
  rescue ActiveRecord::RecordInvalid => e
    render json: json_with_error(message: e.message)
  end

  # Admin: Update user role
  def update_role
    role = Role.find_by(id: params[:role_id])
    return render json: json_with_error(message: "Role not found") unless role

    old_role = @user.role&.name || @user.role&.role
    @user.update!(role_id: role.id)
    track_admin_action('update_role', @user, { old_role: old_role, new_role: role.name || role.role })
    render json: json_with_success(data: @user, default_serializer: UserSerializer)
  end

  def update_profile
    @user.update!(update_profile_params)
    render json: json_with_success(data: @user, default_serializer: UserSerializer)
  end

  def delete_user
    @user.update_attribute(:is_deleted, true)
    track_admin_action('delete', @user)
    render json: json_with_empty_success
  end

  def activity_stats
    reviews_count = Review.where(user_id: current_user.id, is_deleted: false).count
    replies_count = Reply.where(user_id: current_user.id, is_deleted: false).count
    likes_count = Like.where(user_id: current_user.id).where.not(status: :default).count
    
    render json: json_with_success(data: {
      reviews_count: reviews_count,
      replies_count: replies_count,
      likes_count: likes_count
    })
  end

  def recent_comments
    limit = params[:limit]&.to_i || 10
    replies = Reply.where(user_id: current_user.id, is_deleted: false)
                   .order(created_at: :desc)
                   .limit(limit)
                   .includes(:review)

    render json: json_with_success(data: replies, default_serializer: ReplySerializer)
  end

  def my_reviews
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10

    reviews_query = Review.where(user_id: current_user.id, is_deleted: false)
                          .includes(:company, :user)
    total_count = reviews_query.count

    offset = (page - 1) * per_page
    reviews = reviews_query.order(created_at: :desc).offset(offset).limit(per_page)

    response_data = json_with_success(data: reviews, default_serializer: ReviewSerializer)
    response_data[:pagination] = {
      page: page,
      per_page: per_page,
      total: total_count,
      total_pages: (total_count.to_f / per_page).ceil
    }

    render json: response_data
  end

  private

  def update_profile_params
    params.permit(:gender, :first_name, :last_name, :email)
  end

  def create_user_params
    params.require(:user).permit(:email, :password, :first_name, :last_name, :gender)
  end

  def validate_permission
    is_owner = @user.id == current_user&.id
    is_admin = current_user&.role&.admin?
    unless is_owner || is_admin
      render json: json_with_error(message: "can't do action for this user")
    end
  end

  def get_user
    @user = User.find(params[:id])
  end

  def check_admin_role
    unless current_user.role&.admin?
      render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end
  end
end
