module ApiRoutes
  def self.extended(router)
    router.instance_exec do
      devise_for :users, controllers: {
        sessions: 'api/v1/sessions'
      }
      namespace :api do
        namespace :v1 do
          devise_scope :user do
            post 'auth/sign_up', to: 'registrations#create'
            post 'auth/sign_in', to: 'sessions#create'
          end

          resources :company, only: %i[index create update] do
            member do
              get :company_overview
              put :delete_company
              put :restore
              put :update_status
            end
            collection do
              get :all
            end
          end

          resources :review, only: %i[index show create update] do
            member do
              put :delete_review
              put :like
              put :dislike
            end
            collection do
              get :recent
              get :all
            end
          end

          resources :reply, only: %i[index create update destroy] do
          end

          resources :user, only: %i[index show create] do
            member do
              put :delete_user
              put :update_profile
              put :update_role
            end
            collection do
              get :activity_stats
              get :recent_comments
              get :my_reviews
              get :all
              get :stats
            end
          end

          resources :role, only: %i[index show create update] do
            member do
              put :delete_role
              put :update_status
              put :update_permissions
            end
            collection do
              get :available_permissions
            end
          end

          resources :favorite, only: %i[index create destroy] do
            collection do
              get 'check/:company_id', to: 'favorite#check', as: 'check'
            end
          end

          # Public stats endpoint
          get 'stats', to: 'stats#index'
          get 'stats/admin', to: 'stats#admin_stats'
          get 'stats/admin_activities', to: 'stats#admin_activities'

          # Site config endpoints
          resources :site_config, only: %i[index show create update destroy] do
            collection do
              get :public_configs
              get :categories
              put :bulk_update
            end
          end
        end
     end
   end
 end
end