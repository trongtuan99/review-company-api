class AdminActivity < ApplicationRecord
  belongs_to :user

  # Action types
  ACTIONS = %w[
    create update delete restore
    update_status update_role update_permissions
    login logout
  ].freeze

  # Resource types
  RESOURCE_TYPES = %w[User Company Review Role].freeze

  validates :action, presence: true, inclusion: { in: ACTIONS }
  validates :resource_type, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :by_action, ->(action) { where(action: action) }
  scope :by_resource, ->(type) { where(resource_type: type) }

  def self.log(user:, action:, resource:, details: {}, request: nil)
    create!(
      user: user,
      action: action,
      resource_type: resource.class.name,
      resource_id: resource.id,
      resource_name: extract_resource_name(resource),
      details: details,
      ip_address: request&.remote_ip,
      user_agent: request&.user_agent
    )
  rescue => e
    Rails.logger.error "Failed to log admin activity: #{e.message}"
    nil
  end

  def self.extract_resource_name(resource)
    case resource
    when User
      [resource.first_name, resource.last_name].compact.join(' ').presence || resource.email
    when Company
      resource.name
    when Review
      resource.title.presence || "Review ##{resource.id.to_s[0..7]}"
    when Role
      resource.name.presence || resource.role
    else
      resource.try(:name) || resource.try(:title) || resource.id.to_s
    end
  end

  def icon
    case action
    when 'create' then '➕'
    when 'update' then '✏️'
    when 'delete' then '🗑️'
    when 'restore' then '♻️'
    when 'update_status' then '🔄'
    when 'update_role' then '👤'
    when 'update_permissions' then '🔐'
    when 'login' then '🔑'
    when 'logout' then '🚪'
    else '📋'
    end
  end

  def action_label
    I18n.t("admin_activity.actions.#{action}", default: action.humanize)
  end

  def resource_label
    I18n.t("admin_activity.resources.#{resource_type.downcase}", default: resource_type)
  end

  def message
    admin_name = [user.first_name, user.last_name].compact.join(' ').presence || user.email
    "#{admin_name} #{action_label} #{resource_label}: #{resource_name}"
  end
end
