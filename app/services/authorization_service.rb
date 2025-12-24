# Authorization Service for role-based access control
class AuthorizationService
  RESOURCES = %w[users companies reviews roles dashboard settings].freeze
  ACTIONS = %w[read create update delete approve].freeze

  def initialize(user)
    @user = user
    @role = user&.role
  end

  # Check if user can perform action on resource
  def can?(action, resource)
    return false unless @role&.active?

    resource_key = resource.to_s.downcase
    action_key = action.to_s.downcase

    # Check allow_all_action flag first
    return true if @role.allow_all_action

    # Check specific permissions
    permissions = @role.permissions || {}
    resource_permissions = permissions[resource_key] || []

    resource_permissions.include?(action_key)
  end

  # Check if user can access admin console
  def can_access_admin?
    return false unless @role&.active?
    return true if @role.allow_all_action
    return true if @role.admin? || @role.owner?

    # Check if has any admin-level permission
    permissions = @role.permissions || {}
    admin_resources = %w[users roles dashboard settings]
    admin_resources.any? { |r| permissions[r]&.any? }
  end

  # Get all allowed actions for a resource
  def allowed_actions(resource)
    return [] unless @role&.active?
    return ACTIONS if @role.allow_all_action

    permissions = @role.permissions || {}
    permissions[resource.to_s.downcase] || []
  end

  # Get all accessible resources
  def accessible_resources
    return [] unless @role&.active?
    return RESOURCES if @role.allow_all_action

    permissions = @role.permissions || {}
    permissions.keys.select { |r| permissions[r]&.any? }
  end

  class << self
    def authorize!(user, action, resource)
      service = new(user)
      unless service.can?(action, resource)
        raise UnauthorizedError, "You don't have permission to #{action} #{resource}"
      end
    end
  end

  class UnauthorizedError < StandardError; end
end
