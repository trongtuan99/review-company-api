class Api::V1::ReviewController < ApplicationController
  include AdminTrackable

  around_action :with_transaction, except: %i[index show recent all]
  before_action :authenticate_user!, except: %i[index show recent all]
  before_action :get_company, only: [:create, :index]
  before_action :get_review, only: [:show, :update, :delete_review, :like, :dislike, :update_status]
  before_action :validate_update, only: :update
  before_action :validate_delete_permission, only: :delete_review
  before_action :get_like_record, only: [:like, :dislike]
  before_action :validate_admin_permission, only: [:update_status]

  def index
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    
    reviews_query = @company.reviews.where(is_deleted: false)
    
    # Show approved and pending reviews to everyone
    # Hide rejected reviews (except owner can see their own rejected reviews)
    if current_user
      # User can see: approved, pending, OR their own reviews (including rejected)
      reviews_query = reviews_query.where(
        "status IN (?, ?) OR user_id = ?",
        Review.statuses[:approved],
        Review.statuses[:pending],
        current_user.id
      )
    else
      # Anonymous users can see approved and pending only
      reviews_query = reviews_query.where(status: [Review.statuses[:approved], Review.statuses[:pending]])
    end
    total_count = reviews_query.count
    
    if page == 1
      top_reviews = reviews_query.order(total_like: :desc, created_at: :desc).limit(10).to_a
      recent_reviews = reviews_query.order(created_at: :desc).limit(10).to_a
      combined = (top_reviews + recent_reviews).uniq
      data = combined.sort_by { |r| -r.created_at.to_i }.first(10)
    else
      offset = (page - 1) * per_page
      data = reviews_query.order(created_at: :desc).offset(offset).limit(per_page)
    end
    
    response_data = json_with_success(
      data: data, 
      default_serializer: ReviewSerializer,
      options: { scope: current_user }
    )
    
    response_data[:pagination] = {
      page: page,
      per_page: per_page,
      total: total_count,
      total_pages: (total_count.to_f / per_page).ceil
    }
    
    render json: response_data
  end

  def show
    render json: json_with_success(
      data: @review,
      default_serializer: ReviewSerializer,
      options: { scope: current_user }
    )
  end

  def create
    create_payload = create_update_params.merge!(company_id: @company.id, user_id: current_user.id)
    review = Review.new(create_payload)

    if review.save
      render json: json_with_success(data: review, default_serializer: ReviewSerializer)
    else
      render json: json_with_error(message: review.errors.full_messages.join(', ')), status: :unprocessable_entity
    end
  end

  def update
    @review.update!(create_update_params)
    # If approval is required, an edit should reset the status to pending
    if SiteConfig.get('require_review_approval', false) && !current_user.role&.admin?
      @review.pending!
    end
    render json: json_with_success(data: @review, default_serializer: ReviewSerializer)
  end

  def update_status
    if @review.update(status: params.require(:status))
      track_admin_action(
        'update_status', 
        @review, 
        from: @review.status_before_last_save, 
        to: @review.status
      )
      render json: json_with_success(data: @review, default_serializer: ReviewSerializer)
    else
      render json: json_with_error(message: @review.errors.full_messages.join(', '))
    end
  end

  def delete_review
    @review.update_attribute(:is_deleted, true)
    track_admin_action('delete', @review)
    render json: json_with_empty_success
  end

  def like
    handle_like_dislike(:like)
  end

  def dislike
    handle_like_dislike(:dislike)
  end

  def recent
    limit = params[:limit]&.to_i || 10
    # Show both approved and pending reviews (not rejected)
    reviews = Review.where(is_deleted: false)
                    .where(status: [Review.statuses[:approved], Review.statuses[:pending]])
                    .order(created_at: :desc)
                    .limit(limit)
                    .includes(:company)

    render json: json_with_success(
      data: reviews,
      default_serializer: ReviewSerializer,
      options: { scope: current_user }
    )
  end

  # Get all reviews with pagination (for admin)
  def all
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    status = params[:status]
    search = params[:q] || params[:search]
    sort_by = params[:sort_by] || 'created_at'
    sort_order = params[:sort_order] || 'desc'

    reviews_query = Review.where(is_deleted: false).includes(:company, :user)

    # Filter by status
    if status.present? && status != 'all'
      reviews_query = reviews_query.where(status: Review.statuses[status.to_sym])
    end

    # Search by title, content, or company name
    if search.present?
      reviews_query = reviews_query.joins(:company).where(
        "reviews.title ILIKE :q OR reviews.reviews_content ILIKE :q OR companies.name ILIKE :q",
        q: "%#{search}%"
      )
    end

    total_count = reviews_query.count

    # Sorting
    case sort_by
    when 'score'
      reviews_query = reviews_query.order(score: sort_order.to_sym, created_at: :desc)
    when 'total_like'
      reviews_query = reviews_query.order(total_like: sort_order.to_sym, created_at: :desc)
    else
      reviews_query = reviews_query.order(created_at: sort_order.to_sym)
    end

    offset = (page - 1) * per_page
    data = reviews_query.offset(offset).limit(per_page)

    response_data = json_with_success(
      data: data,
      default_serializer: ReviewSerializer,
      options: { scope: current_user }
    )

    response_data[:pagination] = {
      page: page,
      per_page: per_page,
      total: total_count,
      total_pages: (total_count.to_f / per_page).ceil
    }

    render json: response_data
  end

  private

  def handle_like_dislike(status)
    # Logic:
    # - If clicking like/dislike when already in that state -> toggle to default
    # - If clicking like/dislike when in opposite state -> switch to new state
    # - If clicking like/dislike when in default state -> set to new state
    if @like_record.present?
      current_status = @like_record.status.to_sym
      if current_status == status
        # Already in this state, toggle to default
        new_status = :default
      else
        # Switch to the requested status
        new_status = status
      end
      @like_record.update!(status: new_status)
    else
      # Create new like record with the requested status
      @like_record = Like.create!(
        user_id: current_user.id,
        review_id: @review.id,
        status: status
      )
    end
    
    # Reload review to get updated total_like and total_dislike
    # The after_commit callback should have already updated these values
    # Reload review and reset association cache to ensure serializer can find the like record
    @review.reload
    # Reset association cache so serializer will query fresh from database
    @review.association(:likes).reset
    
    render json: json_with_success(
      data: @review, 
      default_serializer: ReviewSerializer,
      options: { scope: current_user },
      message: I18n.t('controller.base.success')
    )
  rescue => e
    render json: json_with_error(message: e.message)
  end

  def validate_update
    return render json: json_with_error(message: "cant update deleted reivew") if @review.is_deleted
  end

  def get_review
    @review = Review.find_by(id: params[:id])
    return render json: json_with_error(message: "review not found") unless @review

    # Admin can see anything
    return if current_user&.role&.admin?

    # User can see their own review regardless of status
    return if @review.user_id == current_user&.id

    # Public can only see approved reviews
    unless @review.approved?
      render json: json_with_error(message: "review not found or not yet approved")
    end
  end

  def get_company
    @company = Company.find_by(id: params[:company_id])
    return render json: json_with_error(message: "company not found") unless @company
  end

  def create_update_params
    # Permit all fields from the frontend form
    params.require(:review).permit(
      :title, :reviews_content, :score, :job_title, :is_anonymous,
      :pros, :cons, :management_rating, :culture_rating,
      :employment_status,
      # These are the actual names sent from the new form
      :work_environment_rating, 
      :salary_benefits_rating, 
      :work_pressure_rating,
      :employment_duration, 
      :would_recommend
    )
  end

  def get_like_record
    @like_record = Like.get_like_review_by_user_id(params[:id], current_user.id).first
  end

  def validate_delete_permission
    is_owner = @review.user_id == current_user.id
    is_admin = current_user.role&.admin?
    unless is_owner || is_admin
      render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end
  end

  def validate_admin_permission
    unless current_user.role&.admin?
      render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end
  end
end
