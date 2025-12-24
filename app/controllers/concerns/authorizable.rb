# Authorization concern for controllers
module Authorizable
  extend ActiveSupport::Concern

  included do
    helper_method :can? if respond_to?(:helper_method)
  end

  # Check if current user can perform action on resource
  def can?(action, resource)
    return false unless current_user&.role

    current_user.role.can?(action, resource)
  end

  # Authorize action - raise error if not allowed
  def authorize!(action, resource)
    unless can?(action, resource)
      render json: json_with_error(
        message: I18n.t('controller.base.not_permission'),
        status: :forbidden
      ), status: :forbidden
      return false
    end
    true
  end

  # Check if user can access admin console
  def can_access_admin?
    return false unless current_user&.role&.active?

    role = current_user.role
    return true if role.allow_all_action
    return true if role.admin? || role.owner?

    # Check if has any admin-level permission
    permissions = role.permissions || {}
    admin_resources = %w[users roles dashboard settings]
    admin_resources.any? { |r| permissions[r]&.any? }
  end

  # Before action helper for requiring specific permission
  def require_permission(action, resource)
    authorize!(action, resource)
  end

  class_methods do
    # Define permission requirements for actions
    def authorize_resource(resource, options = {})
      before_action(options) do
        action_map = {
          index: :read,
          show: :read,
          create: :create,
          update: :update,
          destroy: :delete,
          delete: :delete
        }
        action = action_map[action_name.to_sym] || action_name.to_sym
        authorize!(action, resource)
      end
    end
  end
end
