class Api::V1::RoleController < ApplicationController
  before_action :authenticate_user!
  before_action :check_admin_role
  before_action :get_role, only: [:update, :delete_role]

  # Get all roles
  def index
    roles = Role.where.not(status: :deleted).order(:id)
    render json: json_with_success(data: roles, default_serializer: RoleSerializer)
  end

  # Create new role
  def create
    role = Role.create!(create_params)
    render json: json_with_success(data: role, default_serializer: RoleSerializer)
  rescue ActiveRecord::RecordInvalid => e
    render json: json_with_error(message: e.message)
  end

  # Update role
  def update
    @role.update!(update_params)
    render json: json_with_success(data: @role, default_serializer: RoleSerializer)
  rescue ActiveRecord::RecordInvalid => e
    render json: json_with_error(message: e.message)
  end

  # Soft delete role
  def delete_role
    # Prevent deleting if users are using this role
    if @role.users.where(is_deleted: false).exists?
      return render json: json_with_error(message: "Cannot delete role that is assigned to users")
    end

    @role.update!(status: :deleted)
    render json: json_with_empty_success
  end

  private

  def get_role
    @role = Role.find(params[:id])
  end

  def create_params
    params.require(:role).permit(:role, :allow_all_action, :allow_create, :allow_read, :allow_update)
  end

  def update_params
    params.require(:role).permit(:allow_all_action, :allow_create, :allow_read, :allow_update, :status)
  end

  def check_admin_role
    unless current_user.role&.admin?
      render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end
  end
end
