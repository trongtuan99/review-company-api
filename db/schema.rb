# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2025_12_28_001538) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "admin_activities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "action", null: false
    t.string "resource_type", null: false
    t.uuid "resource_id"
    t.string "resource_name"
    t.jsonb "details", default: {}
    t.string "ip_address"
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_admin_activities_on_action"
    t.index ["created_at"], name: "index_admin_activities_on_created_at"
    t.index ["resource_type"], name: "index_admin_activities_on_resource_type"
    t.index ["user_id"], name: "index_admin_activities_on_user_id"
  end

  create_table "areas", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "tenant_name", limit: 255, null: false
    t.integer "status", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "companies", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", limit: 100, null: false
    t.integer "is_active", default: 1, null: false
    t.string "owner", limit: 100, null: false
    t.string "main_office", limit: 100
    t.string "phone", limit: 30
    t.uuid "country_id"
    t.integer "company_type", default: 0, null: false
    t.integer "company_size", default: 1, null: false
    t.float "avg_score", default: 0.0
    t.integer "total_reviews", default: 0
    t.boolean "is_good_company", default: true
    t.string "logo", limit: 255
    t.string "website", limit: 255
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_deleted", default: false
    t.string "industry"
    t.integer "employee_count_min", default: 0
    t.integer "employee_count_max", default: 0
    t.boolean "is_hiring", default: false
    t.text "description"
    t.integer "founded_year"
    t.string "tech_stack", limit: 500
    t.jsonb "benefits", default: []
    t.jsonb "social_links", default: {}
  end

  create_table "favorites", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "company_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["company_id"], name: "index_favorites_on_company_id"
    t.index ["user_id", "company_id"], name: "index_favorites_on_user_id_and_company_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "likes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "review_id", null: false
    t.uuid "user_id", null: false
    t.integer "status", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["review_id", "user_id"], name: "index_likes_on_review_id_and_user_id", unique: true
    t.index ["review_id"], name: "index_likes_on_review_id"
  end

  create_table "replies", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "review_id", null: false
    t.uuid "user_id", null: false
    t.text "content", null: false
    t.boolean "is_deleted", default: false
    t.boolean "is_edited", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["review_id", "user_id"], name: "index_replies_on_review_id_and_user_id"
    t.index ["review_id"], name: "index_replies_on_review_id"
  end

  create_table "reviews", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.uuid "company_id"
    t.integer "score", default: 1, null: false
    t.string "title", limit: 100
    t.text "reviews_content"
    t.boolean "vote_for_quit", default: false, null: false
    t.boolean "vote_for_work", default: true, null: false
    t.boolean "is_anonymous", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_deleted", default: false
    t.integer "total_like", default: 0
    t.integer "total_dislike", default: 0
    t.integer "total_reply", default: 0
    t.string "job_title"
    t.text "pros"
    t.text "cons"
    t.integer "salary_satisfaction", default: 0
    t.integer "work_life_balance", default: 0
    t.integer "career_growth", default: 0
    t.integer "management_rating", default: 0
    t.integer "culture_rating", default: 0
    t.integer "employment_status", default: 0
    t.decimal "years_employed", precision: 3, scale: 1, default: "0.0"
    t.integer "status", default: 1, null: false
    t.index ["status"], name: "index_reviews_on_status"
  end

  create_table "roles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "role", default: 0, null: false
    t.integer "status", default: 1
    t.boolean "allow_all_action", default: false
    t.boolean "allow_create", default: false
    t.boolean "allow_read", default: true
    t.boolean "allow_update", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", limit: 50
    t.string "description", limit: 255
    t.jsonb "permissions", default: {}
  end

  create_table "sessions", force: :cascade do |t|
    t.string "session_id", null: false
    t.text "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_sessions_on_session_id", unique: true
    t.index ["updated_at"], name: "index_sessions_on_updated_at"
  end

  create_table "site_configs", force: :cascade do |t|
    t.string "key", null: false
    t.text "value"
    t.string "value_type", default: "string"
    t.string "category", default: "general"
    t.string "label"
    t.text "description"
    t.boolean "is_public", default: false
    t.integer "sort_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_site_configs_on_category"
    t.index ["is_public"], name: "index_site_configs_on_is_public"
    t.index ["key"], name: "index_site_configs_on_key", unique: true
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "gender", default: 0, null: false
    t.string "first_name", limit: 30, null: false
    t.string "last_name", limit: 30, null: false
    t.integer "total_reviews", default: 0, null: false
    t.string "phone_number", limit: 30
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "role_id"
    t.boolean "is_deleted", default: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "admin_activities", "users"
  add_foreign_key "favorites", "companies"
  add_foreign_key "likes", "reviews"
  add_foreign_key "replies", "reviews"
end
