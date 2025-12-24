class CreateAdminActivities < ActiveRecord::Migration[7.0]
  def change
    create_table :admin_activities, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true, null: false
      t.string :action, null: false
      t.string :resource_type, null: false
      t.uuid :resource_id
      t.string :resource_name
      t.jsonb :details, default: {}
      t.string :ip_address
      t.string :user_agent

      t.timestamps
    end

    add_index :admin_activities, :action
    add_index :admin_activities, :resource_type
    add_index :admin_activities, :created_at
  end
end
