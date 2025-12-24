class CreateSiteConfigs < ActiveRecord::Migration[7.0]
  def change
    create_table :site_configs do |t|
      t.string :key, null: false
      t.text :value
      t.string :value_type, default: 'string' # string, boolean, integer, json
      t.string :category, default: 'general' # general, contact, features, appearance
      t.string :label
      t.text :description
      t.boolean :is_public, default: false # public configs can be fetched without auth
      t.integer :sort_order, default: 0

      t.timestamps
    end

    add_index :site_configs, :key, unique: true
    add_index :site_configs, :category
    add_index :site_configs, :is_public

    # Seed default configs
    reversible do |dir|
      dir.up do
        # Contact configs
        execute <<-SQL
          INSERT INTO site_configs (key, value, value_type, category, label, description, is_public, sort_order, created_at, updated_at)
          VALUES
          ('contact_email', 'contact@reviewcompany.vn', 'string', 'contact', 'Email lien he', 'Email lien he chinh', true, 1, NOW(), NOW()),
          ('contact_phone', '+84 123 456 789', 'string', 'contact', 'So dien thoai', 'So dien thoai lien he', true, 2, NOW(), NOW()),
          ('contact_address', '123 Duong ABC, Quan XYZ, TP. Ho Chi Minh', 'string', 'contact', 'Dia chi', 'Dia chi van phong', true, 3, NOW(), NOW()),
          ('facebook_url', '', 'string', 'contact', 'Facebook', 'Link Facebook fanpage', true, 4, NOW(), NOW()),
          ('twitter_url', '', 'string', 'contact', 'Twitter/X', 'Link Twitter/X', true, 5, NOW(), NOW()),
          ('linkedin_url', '', 'string', 'contact', 'LinkedIn', 'Link LinkedIn', true, 6, NOW(), NOW()),

          -- Feature toggles
          ('feature_reviews_enabled', 'true', 'boolean', 'features', 'Bat/Tat Review', 'Cho phep nguoi dung viet review', false, 1, NOW(), NOW()),
          ('feature_registration_enabled', 'true', 'boolean', 'features', 'Bat/Tat Dang ky', 'Cho phep nguoi dung dang ky moi', false, 2, NOW(), NOW()),
          ('feature_company_creation_enabled', 'true', 'boolean', 'features', 'Bat/Tat Tao cong ty', 'Cho phep nguoi dung tao cong ty moi', false, 3, NOW(), NOW()),
          ('feature_anonymous_reviews', 'true', 'boolean', 'features', 'Bat/Tat Review an danh', 'Cho phep review an danh', false, 4, NOW(), NOW()),
          ('feature_favorites_enabled', 'true', 'boolean', 'features', 'Bat/Tat Yeu thich', 'Cho phep yeu thich cong ty', false, 5, NOW(), NOW()),
          ('feature_replies_enabled', 'true', 'boolean', 'features', 'Bat/Tat Tra loi', 'Cho phep tra loi review', false, 6, NOW(), NOW()),

          -- Appearance configs
          ('site_name', 'Review Company', 'string', 'appearance', 'Ten website', 'Ten hien thi tren website', true, 1, NOW(), NOW()),
          ('site_tagline', 'Nen tang danh gia cong ty #1 Viet Nam', 'string', 'appearance', 'Slogan', 'Slogan hien thi tren trang chu', true, 2, NOW(), NOW()),
          ('footer_copyright', 'Review Company. Tat ca quyen duoc bao luu.', 'string', 'appearance', 'Copyright', 'Text copyright o footer', true, 3, NOW(), NOW()),

          -- General configs
          ('reviews_per_page', '10', 'integer', 'general', 'Reviews/trang', 'So luong review hien thi moi trang', false, 1, NOW(), NOW()),
          ('companies_per_page', '20', 'integer', 'general', 'Companies/trang', 'So luong cong ty hien thi moi trang', false, 2, NOW(), NOW()),
          ('min_review_length', '20', 'integer', 'general', 'Do dai review toi thieu', 'So ky tu toi thieu cho noi dung review', false, 3, NOW(), NOW()),
          ('require_review_approval', 'false', 'boolean', 'general', 'Duyet review', 'Yeu cau admin duyet review truoc khi hien thi', false, 4, NOW(), NOW());
        SQL
      end
    end
  end
end
