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

ActiveRecord::Schema[7.0].define(version: 2024_02_14_141045) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

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
  end

  create_table "sessions", force: :cascade do |t|
    t.string "session_id", null: false
    t.text "data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_sessions_on_session_id", unique: true
    t.index ["updated_at"], name: "index_sessions_on_updated_at"
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

  add_foreign_key "likes", "reviews"
  add_foreign_key "replies", "reviews"
end
