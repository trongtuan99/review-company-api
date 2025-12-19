source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.1.2"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.0.8"

gem 'karafka', '~> 2.4', '>= 2.4.13'

# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"
gem 'versionist'
gem 'active_model_serializers'
gem 'kaminari'
gem 'rails-i18n'
gem 'sidekiq', '~> 6.5', '>= 6.5.1'
gem 'clockwork'
gem 'devise'
gem 'countries'
gem 'devise-jwt'
gem 'ros-apartment', require: 'apartment'

gem "thin"
gem "sinatra"
gem "em-websocket"

# streaming kafka
gem 'connection_pool'
gem 'ruby-kafka'
gem 'rqrcode'
# Use the Puma web server [https://github.com/puma/puma]
gem "puma", "~> 5.0"

# Use Redis adapter to run Action Cable in production
gem "redis", "~> 4.0"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Rack CORS for handling Cross-Origin Resource Sharing (CORS), making cross-origin AJAX possible
gem "rack-cors"

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'rspec-rails'
  gem 'dotenv-rails'
  gem 'faker'
  gem 'rubocop'
  gem 'database_cleaner'
  gem 'factory_bot'
end

group :development do
  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"
end

