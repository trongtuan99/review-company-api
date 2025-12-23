class Api::V1::SessionsController < Devise::SessionsController
  include ResponseHelper

  def create
    resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)

    user_data = resource.as_json
    user_data[:role] = resource.role&.role  # Include role name (e.g., 'admin', 'user')
    user_data[:access_token] = AuthToken.access_token({ user_id: resource.id })

    render json: json_with_success(data: user_data)
  end
end
