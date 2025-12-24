class AddPermissionsToRoles < ActiveRecord::Migration[7.0]
  def change
    # Add granular permissions for each resource
    add_column :roles, :permissions, :jsonb, default: {}

    # Permissions structure:
    # {
    #   "users": ["read", "create", "update", "delete"],
    #   "companies": ["read", "create", "update", "delete"],
    #   "reviews": ["read", "create", "update", "delete", "approve"],
    #   "roles": ["read", "create", "update", "delete"],
    #   "dashboard": ["read"]
    # }

    # Set default permissions for existing roles
    reversible do |dir|
      dir.up do
        # Admin gets all permissions
        execute <<-SQL
          UPDATE roles
          SET permissions = '{
            "users": ["read", "create", "update", "delete"],
            "companies": ["read", "create", "update", "delete"],
            "reviews": ["read", "create", "update", "delete", "approve"],
            "roles": ["read", "create", "update", "delete"],
            "dashboard": ["read"],
            "settings": ["read", "update"]
          }'::jsonb
          WHERE role = 2;
        SQL

        # Owner gets all permissions
        execute <<-SQL
          UPDATE roles
          SET permissions = '{
            "users": ["read", "create", "update", "delete"],
            "companies": ["read", "create", "update", "delete"],
            "reviews": ["read", "create", "update", "delete", "approve"],
            "roles": ["read", "create", "update", "delete"],
            "dashboard": ["read"],
            "settings": ["read", "update"]
          }'::jsonb
          WHERE role = 3;
        SQL

        # User gets limited permissions
        execute <<-SQL
          UPDATE roles
          SET permissions = '{
            "companies": ["read"],
            "reviews": ["read", "create"]
          }'::jsonb
          WHERE role = 1;
        SQL

        # Anonymous gets read only
        execute <<-SQL
          UPDATE roles
          SET permissions = '{
            "companies": ["read"],
            "reviews": ["read"]
          }'::jsonb
          WHERE role = 4;
        SQL
      end
    end
  end
end
