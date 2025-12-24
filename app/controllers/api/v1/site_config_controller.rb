# frozen_string_literal: true

class Api::V1::SiteConfigController < ApplicationController
  before_action :authenticate_user!, except: [:public_configs]
  before_action :authorize_admin!, except: [:public_configs]
  before_action :set_config, only: [:show, :update, :destroy]

  # GET /api/v1/site_config/public
  # Public configs - no auth required
  def public_configs
    configs = SiteConfig.public_configs.ordered
    render json: json_with_success(data: serialize_configs(configs))
  end

  # GET /api/v1/site_config
  # All configs - admin only
  def index
    configs = SiteConfig.ordered

    # Filter by category if provided
    if params[:category].present?
      configs = configs.by_category(params[:category])
    end

    render json: json_with_success(data: serialize_configs(configs))
  end

  # GET /api/v1/site_config/:id
  def show
    render json: json_with_success(data: serialize_config(@config))
  end

  # POST /api/v1/site_config
  def create
    @config = SiteConfig.new(config_params)

    if @config.save
      render json: json_with_success(data: serialize_config(@config), message: 'Config created successfully')
    else
      render json: json_with_error(message: @config.errors.full_messages.join(', '))
    end
  end

  # PUT /api/v1/site_config/:id
  def update
    if @config.update(config_params)
      render json: json_with_success(data: serialize_config(@config), message: 'Config updated successfully')
    else
      render json: json_with_error(message: @config.errors.full_messages.join(', '))
    end
  end

  # PUT /api/v1/site_config/bulk_update
  def bulk_update
    updates = params[:configs] || []
    updated_configs = []
    errors = []

    updates.each do |config_data|
      config = SiteConfig.find_by(key: config_data[:key])
      if config
        config.value = config_data[:value]
        if config.save
          updated_configs << config
        else
          errors << "#{config_data[:key]}: #{config.errors.full_messages.join(', ')}"
        end
      else
        errors << "Config not found: #{config_data[:key]}"
      end
    end

    if errors.empty?
      render json: json_with_success(
        data: serialize_configs(updated_configs),
        message: "Updated #{updated_configs.count} configs successfully"
      )
    else
      render json: json_with_error(
        message: errors.join('; '),
        data: serialize_configs(updated_configs)
      )
    end
  end

  # DELETE /api/v1/site_config/:id
  def destroy
    if @config.destroy
      render json: json_with_success(message: 'Config deleted successfully')
    else
      render json: json_with_error(message: 'Cannot delete config')
    end
  end

  # GET /api/v1/site_config/categories
  def categories
    render json: json_with_success(data: [
      { key: 'general', label: 'Cai dat chung', icon: '⚙️' },
      { key: 'contact', label: 'Thong tin lien he', icon: '📞' },
      { key: 'features', label: 'Tinh nang', icon: '🚀' },
      { key: 'appearance', label: 'Giao dien', icon: '🎨' }
    ])
  end

  private

  def set_config
    @config = SiteConfig.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: json_with_error(message: 'Config not found'), status: :not_found
  end

  def config_params
    params.require(:site_config).permit(:key, :value, :value_type, :category, :label, :description, :is_public, :sort_order)
  end

  def authorize_admin!
    unless current_user&.role&.admin? || current_user&.role&.owner?
      render json: json_with_error(message: I18n.t("controller.base.not_permission")), status: :forbidden
    end
  end

  def serialize_config(config)
    {
      id: config.id,
      key: config.key,
      value: config.value,
      typed_value: config.typed_value,
      value_type: config.value_type,
      category: config.category,
      label: config.label,
      description: config.description,
      is_public: config.is_public,
      sort_order: config.sort_order,
      created_at: config.created_at,
      updated_at: config.updated_at
    }
  end

  def serialize_configs(configs)
    configs.map { |c| serialize_config(c) }
  end
end
