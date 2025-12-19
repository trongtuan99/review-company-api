list_review = []
10.times do
  list_review.push(
    {
      score: Faker::Number.between(from: 1, to: 10),
      title: Faker::Lorem.sentence,
      reviews_content: Faker::Lorem.paragraph,
      vote_for_quit: [true, false].sample,
      is_anonymous: [true, false].sample,
    }
  )
end
Area.where(status: :active).each do |tenant|
  tenant.change_tenant do
    puts "current_tenant is #{tenant.name}"
    list_review.each do |review|
      company = Company.order("RANDOM()").limit(1).first
      if company
        review[:company_id] = company.id
        Review.create(review)
        puts "review: #{review[:title]} created"
      else
        puts "Warning: No companies found for tenant #{tenant.name}, skipping review creation"
      end
    end
    puts 'reviews created'
  end
end

