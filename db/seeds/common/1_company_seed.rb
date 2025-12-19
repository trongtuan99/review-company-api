list_company = []
10.times do
  list_company.push(
    {
      name: Faker::Company.name,
      owner: Faker::Name.name,
      main_office: Faker::Address.city,
      phone: Faker::PhoneNumber.phone_number,
      avg_score: 1,
      website: Faker::Internet.url,
      company_type: "unknown",
      company_size: Faker::Number.between(from: 1, to: 1000),
    }
  )
end
Area.where(status: :active).each do |tenant|
  tenant.change_tenant do
    list_company.each do |com|
      unless Company.exists?(name: com[:name], company_type: com[:company_type])
        Company.create(com)
        puts "config: #{com[:name]} created"
      end
    end
    puts 'Company created'
  end
end

