class Role < ApplicationRecord
  # Base role types (predefined)
  enum role: {
    user: 1,
    admin: 2,
    owner: 3,
    anonymous: 4,
    custom: 5,  # For custom/dynamic roles
  }

  enum status: {
    active: 1,
    inactive: 2,
    deleted: 3,
  }

  has_many :users

  validates :name, presence: true, length: { maximum: 50 }, on: :create, if: -> { self.name.present? || self.custom? }
  validates :name, uniqueness: { case_sensitive: false }, allow_blank: true

  # Available resources and actions for permissions
  RESOURCES = %w[users companies reviews roles dashboard settings].freeze
  ACTIONS = %w[read create update delete approve].freeze

  # Display name - use name column if available, fallback to enum
  def display_name
    name.presence || role&.titleize
  end

  # Check if this is a custom role
  def custom_role?
    custom? || !%w[user admin owner anonymous].include?(role)
  end

  # Check if role has permission for action on resource
  def can?(action, resource)
    return false unless active?
    return true if allow_all_action

    resource_key = resource.to_s.downcase
    action_key = action.to_s.downcase
    resource_permissions = permissions&.dig(resource_key) || []
    resource_permissions.include?(action_key)
  end

  # Add permission to role
  def add_permission(resource, action)
    self.permissions ||= {}
    self.permissions[resource.to_s] ||= []
    self.permissions[resource.to_s] << action.to_s unless self.permissions[resource.to_s].include?(action.to_s)
    save
  end

  # Remove permission from role
  def remove_permission(resource, action)
    return unless self.permissions&.dig(resource.to_s)
    self.permissions[resource.to_s].delete(action.to_s)
    save
  end

  # Set all permissions for a resource
  def set_resource_permissions(resource, actions)
    self.permissions ||= {}
    self.permissions[resource.to_s] = Array(actions).map(&:to_s)
    save
  end

  # Get permissions summary
  def permissions_summary
    return 'All permissions' if allow_all_action
    return 'No permissions' if permissions.blank?

    permissions.map do |resource, actions|
      "#{resource}: #{actions.join(', ')}"
    end.join(' | ')
  end
end
