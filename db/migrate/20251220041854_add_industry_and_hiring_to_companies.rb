class AddIndustryAndHiringToCompanies < ActiveRecord::Migration[7.0]
  def change
    add_column :companies, :industry, :string
    add_column :companies, :employee_count_min, :integer, default: 0
    add_column :companies, :employee_count_max, :integer, default: 0
    add_column :companies, :is_hiring, :boolean, default: false
  end
end
