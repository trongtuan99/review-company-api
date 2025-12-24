# frozen_string_literal: true

class SiteConfig < ApplicationRecord
  validates :key, presence: true, uniqueness: true
  validates :value_type, inclusion: { in: %w[string boolean integer json] }
  validates :category, inclusion: { in: %w[general contact features appearance] }

  scope :by_category, ->(category) { where(category: category) }
  scope :public_configs, -> { where(is_public: true) }
  scope :ordered, -> { order(:category, :sort_order) }

  # Get typed value
  def typed_value
    case value_type
    when 'boolean'
      value.to_s.downcase == 'true'
    when 'integer'
      value.to_i
    when 'json'
      JSON.parse(value) rescue {}
    else
      value
    end
  end

  # Set typed value
  def typed_value=(val)
    case value_type
    when 'json'
      self.value = val.is_a?(String) ? val : val.to_json
    else
      self.value = val.to_s
    end
  end

  # Class methods for easy access
  class << self
    def get(key, default = nil)
      config = find_by(key: key)
      config&.typed_value || default
    end

    def set(key, value)
      config = find_or_initialize_by(key: key)
      config.typed_value = value
      config.save
    end

    # Get all configs as hash
    def to_hash(category: nil, public_only: false)
      scope = ordered
      scope = scope.by_category(category) if category.present?
      scope = scope.public_configs if public_only

      scope.each_with_object({}) do |config, hash|
        hash[config.key] = config.typed_value
      end
    end

    # Feature check helpers
    def feature_enabled?(feature_key)
      get("feature_#{feature_key}", true)
    end

    def reviews_enabled?
      feature_enabled?('reviews_enabled')
    end

    def registration_enabled?
      feature_enabled?('registration_enabled')
    end

    def company_creation_enabled?
      feature_enabled?('company_creation_enabled')
    end

    def anonymous_reviews_enabled?
      feature_enabled?('anonymous_reviews')
    end
  end
end
