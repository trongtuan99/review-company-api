class AddNameToRoles < ActiveRecord::Migration[7.0]
  def change
    add_column :roles, :name, :string, limit: 50
    add_column :roles, :description, :string, limit: 255
    
    # Update existing roles with names
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE roles SET name = 'User' WHERE role = 1;
          UPDATE roles SET name = 'Admin' WHERE role = 2;
          UPDATE roles SET name = 'Owner' WHERE role = 3;
          UPDATE roles SET name = 'Anonymous' WHERE role = 4;
        SQL
      end
    end
  end
end
