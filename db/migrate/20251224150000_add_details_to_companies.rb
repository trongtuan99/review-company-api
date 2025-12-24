class AddDetailsToCompanies < ActiveRecord::Migration[7.0]
  def change
    add_column :companies, :description, :text
    add_column :companies, :founded_year, :integer
    add_column :companies, :tech_stack, :string, limit: 500
    add_column :companies, :benefits, :jsonb, default: []
    add_column :companies, :social_links, :jsonb, default: {}
  end
end
