# Create default Areas (tenants) before seeding other data
list_tenant_name = [Tenant::ASIA_SCHEMA, Tenant::EUROPE_SCHEMA, Tenant::AMERICA_SCHEMA]

list_tenant_name.each do |tenant_name|
  unless Area.exists?(tenant_name: tenant_name)
    Area.create(name: tenant_name.capitalize, tenant_name: tenant_name, status: :active)
    puts "Area: #{tenant_name} created"
  else
    # Ensure existing areas are active
    area = Area.find_by(tenant_name: tenant_name)
    area.update(status: :active) unless area.active?
    puts "Area: #{tenant_name} already exists and is active"
  end
end
puts 'Areas created/verified'

