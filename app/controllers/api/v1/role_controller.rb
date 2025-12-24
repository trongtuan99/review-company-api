class Api::V1::RoleController < ApplicationController
  include AdminTrackable

  before_action :authenticate_user!
  before_action :check_admin_role
  before_action :get_role, only: [:show, :update, :delete_role, :update_status, :update_permissions]

  # Get all roles
  def index
    roles = Role.where.not(status: :deleted).order(:id)
    render json: json_with_success(data: roles, default_serializer: RoleSerializer)
  end

  # Get single role
  def show
    render json: json_with_success(data: @role, default_serializer: RoleSerializer)
  end

  # Create new role
  def create
    role_params = create_params

    # If role name is not a predefined enum value, set as custom role
    predefined_roles = %w[user admin owner anonymous]
    if role_params[:name].present? && !predefined_roles.include?(role_params[:name]&.downcase)
      role_params = role_params.merge(role: :custom)
    end

    # Set default permissions if not provided
    role_params[:permissions] ||= {
      'companies' => ['read'],
      'reviews' => ['read']
    }

    role = Role.create!(role_params)
    track_admin_action('create', role)
    render json: json_with_success(data: role, default_serializer: RoleSerializer)
  rescue ActiveRecord::RecordInvalid => e
    render json: json_with_error(message: e.message)
  end

  # Update role
  def update
    @role.update!(update_params)
    track_admin_action('update', @role)
    render json: json_with_success(data: @role, default_serializer: RoleSerializer)
  rescue ActiveRecord::RecordInvalid => e
    render json: json_with_error(message: e.message)
  end

  # Update role status only
  def update_status
    new_status = params[:status]

    unless Role.statuses.keys.include?(new_status)
      return render json: json_with_error(message: "Invalid status. Valid values: #{Role.statuses.keys.join(', ')}")
    end

    # Prevent deactivating admin role if it's the last active admin
    if new_status != 'active' && @role.admin?
      active_admin_count = Role.where(role: :admin, status: :active).count
      if active_admin_count <= 1
        return render json: json_with_error(message: "Cannot deactivate the last active admin role")
      end
    end

    @role.update!(status: new_status)
    track_admin_action('update_status', @role, { new_status: new_status })
    render json: json_with_success(data: @role, default_serializer: RoleSerializer)
  rescue ActiveRecord::RecordInvalid => e
    render json: json_with_error(message: e.message)
  end

  # Update role permissions
  def update_permissions
    new_permissions = params[:permissions]

    unless new_permissions.is_a?(Hash) || new_permissions.is_a?(ActionController::Parameters)
      return render json: json_with_error(message: "Permissions must be an object with resources as keys")
    end

    # Validate resources and actions
    valid_resources = Role::RESOURCES
    valid_actions = Role::ACTIONS

    sanitized_permissions = {}
    new_permissions.each do |resource, actions|
      resource_key = resource.to_s.downcase
      next unless valid_resources.include?(resource_key)

      valid_action_list = Array(actions).map(&:to_s).select { |a| valid_actions.include?(a) }
      sanitized_permissions[resource_key] = valid_action_list if valid_action_list.any?
    end

    @role.update!(permissions: sanitized_permissions)
    track_admin_action('update_permissions', @role, { permissions: sanitized_permissions })
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

    # Prevent deleting predefined roles
    if %w[user admin owner anonymous].include?(@role.role)
      return render json: json_with_error(message: "Cannot delete predefined system roles")
    end

    @role.update!(status: :deleted)
    track_admin_action('delete', @role)
    render json: json_with_empty_success
  end

  # Get available resources and actions for UI
  def available_permissions
    render json: json_with_success(data: {
      resources: Role::RESOURCES,
      actions: Role::ACTIONS,
      resource_descriptions: {
        'users' => 'Quản lý người dùng',
        'companies' => 'Quản lý công ty',
        'reviews' => 'Quản lý đánh giá',
        'roles' => 'Quản lý vai trò',
        'dashboard' => 'Xem dashboard',
        'settings' => 'Cài đặt hệ thống'
      },
      action_descriptions: {
        'read' => 'Xem',
        'create' => 'Tạo mới',
        'update' => 'Cập nhật',
        'delete' => 'Xóa',
        'approve' => 'Phê duyệt'
      }
    })
  end

  private

  def get_role
    @role = Role.find(params[:id])
  end

  def create_params
    params.require(:role).permit(:name, :description, :allow_all_action, :allow_create, :allow_read, :allow_update, permissions: {})
  end

  def update_params
    params.require(:role).permit(:name, :description, :allow_all_action, :allow_create, :allow_read, :allow_update, :status, permissions: {})
  end

  def check_admin_role
    # Use new permission system - check if user can manage roles
    unless current_user.role&.can?(:read, :roles) || current_user.role&.admin? || current_user.role&.owner?
      render json: json_with_error(message: I18n.t("controller.base.not_permission"))
    end
  end
end
