class Api::V1::CompanyController < ApplicationController
  before_action :authenticate_user!, only: [:create, :update, :delete_company]
  # Allow any authenticated user to create company (not just admin/owner)
  before_action :check_role_permission, only: [:update, :delete_company]
  before_action :get_company, only: [:company_overview, :update, :delete_company]

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
    render json: json_with_success(data: @company, default_serializer: CompanySerializer)
  end

  def delete_company
    @company.update_attribute(:is_deleted, true)
    render json: json_with_empty_success
  end


  private

  def get_company
    @company = Company.find(params[:id])
    return render json: json_with_error(message: "company not found") unless @company
  end

  def create_params
    params.require(:company).permit(:name, :owner, :phone, :main_office, :website, 
                                     :industry, :employee_count_min, :employee_count_max, :is_hiring)
  end

  def update_params
    params.require(:company).permit(:owner, :phone, :main_office, :website,
                                     :industry, :employee_count_min, :employee_count_max, :is_hiring)
  end

  def check_role_permission
    allow_action = current_user.role&.admin? || current_user.role&.owner?
    return render json: json_with_error(message: I18n.t("controller.base.not_permission")) unless allow_action
  end
end
