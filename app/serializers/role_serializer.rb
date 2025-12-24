class RoleSerializer < BaseSerializer
  attributes :id, :role, :name, :display_name, :description, :allow_all_action, :status,
             :allow_create, :allow_read, :allow_update, :permissions, :permissions_summary,
             :created_at, :updated_at, :created_at_timestamp, :updated_at_timestamp

  # Available resources and actions for UI
  attribute :available_resources do
    Role::RESOURCES
  end

  attribute :available_actions do
    Role::ACTIONS
  end
end