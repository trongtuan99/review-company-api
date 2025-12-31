module AdminTrackable
  extend ActiveSupport::Concern

  private

  # Track admin actions - run after transaction to avoid corrupting main transaction
  def track_admin_action(action, resource, details = {})
    return unless current_user
    return unless can_perform_admin_actions?

    # Store data for logging after transaction
    activity_data = {
      user: current_user,
      action: action,
      resource: resource,
      details: details,
      request: request
    }

    # Use after_commit to log activity after main transaction completes
    ActiveRecord::Base.connection.after_transaction_commit do
      begin
        AdminActivity.log(**activity_data)
      rescue => e
        Rails.logger.error "[AdminTrackable] Failed to log activity: #{e.message}"
      end
    end
  rescue => e
    Rails.logger.error "[AdminTrackable] Failed: #{e.message}"
  end

  # Check if user can perform admin actions
  def can_perform_admin_actions?
    return false unless current_user&.role

    # Check if user has any admin-level role
    current_user.role.admin? ||
      current_user.role.owner? ||
      current_user.role.custom? ||
      current_user.role.allow_all_action ||
      has_any_admin_permission?
  end

  # Check if user has any permission that grants admin access
  def has_any_admin_permission?
    return false unless current_user&.role&.permissions.present?

    admin_resources = %w[users companies reviews roles dashboard settings]
    admin_resources.any? do |resource|
      current_user.role.can?(:delete, resource) ||
        current_user.role.can?(:create, resource) ||
        current_user.role.can?(:update, resource)
    end
  end
end
