class Api::V1::UserController < ApplicationController
  around_action :with_transaction, except: %i[update_profile delete_user activity_stats recent_comments]
  before_action :get_user, only: [:update_profile, :delete_user, :index]
  before_action :authenticate_user!, only: [:activity_stats, :recent_comments]
  before_action :validate_permission, only: [:update_profile, :delete_user]

  def index
    render json: json_with_success(data: @user, default_serializer: UserSerializer)
  end

  def update_profile
    @user.update!(update_profile_params)
    render json: json_with_success(data: @user, default_serializer: UserSerializer)
  end

  def delete_user
    @user.update_attribute(:is_deleted, true)
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

  private

  def update_profile_params
    params.permit(:gender, :first_name, :last_name, :email)
  end

  def validate_permission
    return render json: json_with_error(message: "can't do action for this user") \
      unless @user.id == User.current_user.id
  end

  def get_user
    @user = User.find(params[:id])
  end

end
