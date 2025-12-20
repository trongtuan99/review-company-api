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
            end
          end

          resources :review, only: %i[index create update] do
            member do
              put :delete_review
              put :like
              put :dislike
            end
            collection do
              get :recent
            end
          end

          resources :reply, only: %i[index create update destroy] do
          end

          resources :user, only: %i[index] do
            member do
              put :delete_user
              put :update_profile
            end
            collection do
              get :activity_stats
              get :recent_comments
            end
          end

          resources :favorite, only: %i[index create destroy] do
            collection do
              get 'check/:company_id', to: 'favorite#check', as: 'check'
            end
          end
        end
     end
   end
 end
end