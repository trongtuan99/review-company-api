class Api::V1::CompanyController < ApplicationController
  include AdminTrackable

  before_action :authenticate_user!, only: [:create, :update, :delete_company, :all, :restore, :update_status]
  # Allow any authenticated user to create company (not just admin/owner)
  before_action :check_role_permission, only: [:update, :delete_company, :all, :restore, :update_status]
  before_action :get_company, only: [:company_overview, :update, :delete_company, :restore, :update_status]

  def index
    query = params[:q] || params[:search]
    top_rated = params[:top_rated] == 'true'
    exclude_ids = params[:exclude_ids]&.split(',')&.map(&:strip)
    limit = params[:limit]&.to_i
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    
    filter_by = params[:filter_by]
    sort_by = params[:sort_by] || 'created_at'
    sort_order = params[:sort_order] || 'desc'
    location = params[:location]
    
    base_query = Company.where(is_deleted: false)
    
    if query.present?
      base_query = base_query.where("name ILIKE ?", "%#{query}%")
    end
    
    if location.present?
      base_query = base_query.where("main_office ILIKE ?", "%#{location}%")
    end
    
    if filter_by.present?
      case filter_by
      when 'most_reviews'
        base_query = base_query.where("total_reviews > 0")
      when 'highest_rated'
        base_query = base_query.where.not(avg_score: nil).where("total_reviews > 0")
      when 'most_liked'
        base_query = base_query.where("total_reviews > 0")
      end
    end
    
    if top_rated
      data = base_query
        .where.not(avg_score: nil)
        .where("total_reviews > 0")
        .order(avg_score: :desc, total_reviews: :desc)
        .limit(10)
    elsif exclude_ids.present?
      data = base_query.where.not(id: exclude_ids)
      case sort_by
      when 'avg_score'
        data = data.order(avg_score: sort_order.to_sym, total_reviews: :desc, created_at: :desc)
      when 'total_reviews'
        data = data.order(total_reviews: sort_order.to_sym, avg_score: :desc, created_at: :desc)
      when 'created_at'
        data = data.order(created_at: sort_order.to_sym)
      else
        data = data.order(created_at: :desc)
      end
      data = data.limit(limit) if limit.present? && limit > 0
    else
      case sort_by
      when 'avg_score'
        data = base_query.order(avg_score: sort_order.to_sym, total_reviews: :desc, created_at: :desc)
      when 'total_reviews'
        data = base_query.order(total_reviews: sort_order.to_sym, avg_score: :desc, created_at: :desc)
      when 'created_at'
        data = base_query.order(created_at: sort_order.to_sym)
      else
        data = base_query.order(created_at: :desc)
      end
      
      if page.present? && per_page.present?
        total_count = data.count
        total_pages = (total_count.to_f / per_page).ceil
        offset = (page - 1) * per_page
        data = data.limit(per_page).offset(offset)
        
        return render json: {
          status: 'ok',
          data: data.map { |c| CompanySerializer.new(c).as_json },
          pagination: {
            current_page: page,
            per_page: per_page,
            total_count: total_count,
            total_pages: total_pages
          }
        }
      elsif limit.present? && limit > 0
        data = data.limit(limit)
      end
    end
    
    render json: json_with_success(data: data, default_serializer: CompanySerializer)
  end

  def create
    data = Company.create!(create_params)
    render json: json_with_success(data: data, default_serializer: CompanySerializer)
  end

  def company_overview
    render json: json_with_success(data: @company, default_serializer: CompanySerializer)
  end

  def update
    @company.update!(update_params)
    track_admin_action('update', @company)
    render json: json_with_success(data: @company, default_serializer: CompanySerializer)
  end

  def delete_company
    @company.update_attribute(:is_deleted, true)
    track_admin_action('delete', @company)
    render json: json_with_empty_success
  end

  # Admin: Get all companies including deleted ones
  def all
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    search = params[:search] || params[:q]
    sort_by = params[:sort_by] || 'created_at'
    sort_order = params[:sort_order] || 'desc'
    include_deleted = params[:include_deleted] == 'true'
    status_filter = params[:status] # 'active', 'deleted', 'all'

    base_query = Company.all

    # Filter by status
    case status_filter
    when 'active'
      base_query = base_query.where(is_deleted: false)
    when 'deleted'
      base_query = base_query.where(is_deleted: true)
    else
      base_query = base_query.where(is_deleted: false) unless include_deleted
    end

    # Search
    if search.present?
      base_query = base_query.where("name ILIKE ? OR owner ILIKE ? OR main_office ILIKE ?",
                                     "%#{search}%", "%#{search}%", "%#{search}%")
    end

    # Sorting
    case sort_by
    when 'name'
      base_query = base_query.order(name: sort_order.to_sym)
    when 'avg_score'
      base_query = base_query.order(avg_score: sort_order.to_sym, total_reviews: :desc)
    when 'total_reviews'
      base_query = base_query.order(total_reviews: sort_order.to_sym)
    else
      base_query = base_query.order(created_at: sort_order.to_sym)
    end

    # Pagination
    total_count = base_query.count
    total_pages = (total_count.to_f / per_page).ceil
    offset = (page - 1) * per_page
    data = base_query.limit(per_page).offset(offset)

    render json: {
      status: 'ok',
      data: data.map { |c| CompanySerializer.new(c).as_json },
      pagination: {
        current_page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: total_pages
      }
    }
  end

  # Admin: Restore deleted company
  def restore
    unless @company.is_deleted
      return render json: json_with_error(message: "Company is not deleted")
    end

    @company.update!(is_deleted: false)
    track_admin_action('restore', @company)
    render json: json_with_success(data: @company, default_serializer: CompanySerializer)
  end

  # Admin: Update company status (active/inactive)
  def update_status
    is_active = params[:is_active]
    is_deleted = params[:is_deleted]

    updates = {}
    updates[:is_active] = is_active.to_i if is_active.present?
    updates[:is_deleted] = is_deleted == 'true' || is_deleted == true if is_deleted.present?

    if updates.empty?
      return render json: json_with_error(message: "No status provided")
    end

    @company.update!(updates)
    track_admin_action('update_status', @company, updates)
    render json: json_with_success(data: @company, default_serializer: CompanySerializer)
  end

  private

  def get_company
    @company = Company.find(params[:id])
    return render json: json_with_error(message: "company not found") unless @company
  end

  def create_params
    params.require(:company).permit(:name, :owner, :phone, :main_office, :website,
                                     :industry, :employee_count_min, :employee_count_max, :is_hiring,
                                     :logo, :description, :founded_year, :tech_stack,
                                     benefits: [], social_links: {})
  end

  def update_params
    params.require(:company).permit(:owner, :phone, :main_office, :website,
                                     :industry, :employee_count_min, :employee_count_max, :is_hiring,
                                     :logo, :description, :founded_year, :tech_stack,
                                     benefits: [], social_links: {})
  end

  def check_role_permission
    # Use new permission system - check if user can manage companies
    allow_action = current_user.role&.can?(:update, :companies) ||
                   current_user.role&.admin? ||
                   current_user.role&.owner?
    return render json: json_with_error(message: I18n.t("controller.base.not_permission")) unless allow_action
  end
end
