class AddStatusToReviews < ActiveRecord::Migration[7.0]
  def change
    add_column :reviews, :status, :integer, default: 1, null: false
    add_index :reviews, :status
    
    # Update existing reviews to approved status
    reversible do |dir|
      dir.up do
        # Set all existing reviews (created before this migration) to approved
        Review.where(status: nil).update_all(status: 1)
      end
    end
  end
end
