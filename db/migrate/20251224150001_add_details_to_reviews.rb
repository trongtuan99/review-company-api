class AddDetailsToReviews < ActiveRecord::Migration[7.0]
  def change
    add_column :reviews, :pros, :text
    add_column :reviews, :cons, :text
    add_column :reviews, :salary_satisfaction, :integer, default: 0
    add_column :reviews, :work_life_balance, :integer, default: 0
    add_column :reviews, :career_growth, :integer, default: 0
    add_column :reviews, :management_rating, :integer, default: 0
    add_column :reviews, :culture_rating, :integer, default: 0
    add_column :reviews, :employment_status, :integer, default: 0
    add_column :reviews, :years_employed, :decimal, precision: 3, scale: 1, default: 0
  end
end
