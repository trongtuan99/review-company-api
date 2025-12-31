namespace :maintenance do
  desc "Recalculates counter caches and average scores for all companies."
  task recalculate_counters: :environment do
    puts "Starting counter recalculation for all companies..."

    Company.find_in_batches do |companies|
      companies.each do |company|
        print "." # Print a dot for each company processed

        # Recalculate total_reviews based on approved reviews
        approved_reviews_count = company.reviews.approved.count
        
        # Recalculate avg_score based on approved reviews
        if approved_reviews_count > 0
          new_avg_score = company.reviews.approved.average(:score).to_f.round(2)
        else
          new_avg_score = 0.0
        end

        # Update the company record
        # Using update_columns to skip validations and callbacks for efficiency
        company.update_columns(
          total_reviews: approved_reviews_count,
          avg_score: new_avg_score
        )
      end
    end

    puts "\nFinished recalculating counters for all companies."
  end
end
