# Tài Liệu Dự Án ReviewCompany (Tiếng Việt)

## 1. Tổng Quan Dự Án

**ReviewCompany** là một nền tảng SaaS (Software as a Service) đa người dùng (multi-tenant) được xây dựng để người dùng có thể viết và quản lý các bài đánh giá về công ty.

Dự án bao gồm hai thành phần chính:

1.  **Backend:** Một API được xây dựng bằng **Ruby on Rails**, đóng vai trò là lõi của ứng dụng.
2.  **Frontend:** Một ứng dụng trang đơn (Single-Page Application) được xây dựng bằng **React**.

Nền tảng cho phép người dùng tạo tài khoản, đăng nhập, tạo, xem, và quản lý các công ty cũng như các bài đánh giá liên quan. Các tính năng nổi bật bao gồm xác thực người dùng, phân quyền dựa trên vai trò, cập nhật lượt thích (likes) theo thời gian thực, và kiến trúc multi-tenant để tách biệt dữ liệu giữa các "khu vực" (areas) khác nhau.

## 2. Công Nghệ Sử Dụng

### Backend:
*   **Ngôn ngữ & Framework:** Ruby 3.1.2, Rails 7.0.8
*   **Cơ sở dữ liệu:** PostgreSQL
*   **Hàng đợi & Tác vụ nền:** Redis, Sidekiq
*   **Tác vụ theo lịch trình:** Clockwork
*   **Tích hợp sự kiện:** Apache Kafka với Karafka
*   **Xác thực:** Devise và JWT (JSON Web Tokens)
*   **Kiến trúc Multi-tenancy:** Gem `ros-apartment`
*   **Kiểm thử (Testing):** RSpec

### Frontend:
*   **Thư viện/Framework:** React 18
*   **Công cụ build:** Vite
*   **Quản lý dữ liệu từ server:** TanStack React Query
*   **Gọi API:** Axios
*   **Định tuyến (Routing):** React Router
*   **Kiểm tra chất lượng code (Linting):** ESLint

### Cơ sở hạ tầng:
*   **Containerization:** Docker và Docker Compose để thiết lập môi trường phát triển cục bộ.

## 3. Cấu Trúc Thư Mục Chính

*   `/app`: Chứa mã nguồn chính của ứng dụng Rails (models, views, controllers, services).
*   `/FE`: Chứa toàn bộ mã nguồn của ứng dụng React.
*   `/config`: Chứa các tệp cấu hình của ứng dụng Rails, bao gồm định tuyến (routes), cấu hình môi trường, và các initializers.
*   `/db`: Chứa schema của cơ sở dữ liệu, các tệp di chuyển (migrations), và dữ liệu ban đầu (seeds).
*   `/spec`: Chứa các bài kiểm thử (tests) cho ứng dụng Rails.
*   `docker-compose.yml`: Tệp cấu hình để chạy toàn bộ ứng dụng bằng Docker.
*   `Gemfile`: Liệt kê các "gem" (thư viện) Ruby mà dự án sử dụng.
*   `package.json` (trong `FE`): Liệt kê các gói Node.js mà dự án frontend sử dụng.

## 4. Hướng Dẫn Cài Đặt và Chạy Dự Án

### Sử dụng Docker (Khuyến khích)

Đây là cách đơn giản nhất để chạy toàn bộ ứng dụng.

```bash
# Khởi động tất cả các dịch vụ (backend, frontend, database, v.v.) ở chế độ nền
docker-compose up -d
```

### Cài Đặt Thủ Công

#### Backend (Rails API)

1.  **Cài đặt các dependencies:**
    ```bash
    bundle install
    ```

2.  **Thiết lập cơ sở dữ liệu:**
    ```bash
    rails db:create db:migrate db:seed
    ```

3.  **Chạy máy chủ Rails (API):**
    ```bash
    rails server
    ```
    Backend sẽ có sẵn tại `http://localhost:3000`.

4.  **Khởi động các workers chạy nền (trong các terminal riêng biệt):**
    ```bash
    bundle exec sidekiq
    bundle exec clockwork app/clockworks/clock.rb
    bundle exec karafka server
    ```

#### Frontend (React App)

1.  **Di chuyển đến thư mục frontend:**
    ```bash
    cd FE
    ```

2.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```

3.  **Chạy máy chủ phát triển:**
    ```bash
    npm run dev
    ```
    Frontend sẽ có sẵn tại `http://localhost:5173`.

## 5. Chạy Kiểm Thử (Tests)

*   **Backend (RSpec):**
    ```bash
    bundle exec rspec
    ```

*   **Frontend (ESLint):**
    ```bash
    cd FE && npm run lint
    ```

## 6. Tài Liệu API (v1)

Tất cả các endpoint của API đều nằm dưới tiền tố `/api/v1`.

### 6.1. Xác thực (Authentication)

-   `POST /api/v1/auth/sign_up`: Đăng ký người dùng mới.
-   `POST /api/v1/auth/sign_in`: Đăng nhập, trả về một JWT token để sử dụng cho các yêu cầu tiếp theo.

### 6.2. Công ty (Company)

-   `GET /api/v1/company`: Lấy danh sách các công ty (có phân trang).
-   `POST /api/v1/company`: Tạo một công ty mới.
-   `PUT /api/v1/company/:id`: Cập nhật thông tin một công ty.
-   `GET /api/v1/company/:id/company_overview`: Lấy thông tin tổng quan của một công ty.
-   `PUT /api/v1/company/:id/delete_company`: "Xóa mềm" (soft delete) một công ty.
-   `PUT /api/v1/company/:id/restore`: Khôi phục một công ty đã bị xóa mềm.
-   `PUT /api/v1/company/:id/update_status`: Cập nhật trạng thái của một công ty.
-   `GET /api/v1/company/all`: Lấy tất cả các công ty (không phân trang).

### 6.3. Đánh giá (Review)

-   `GET /api/v1/review`: Lấy danh sách các bài đánh giá (có phân trang).
-   `GET /api/v1/review/:id`: Lấy chi tiết một bài đánh giá.
-   `POST /api/v1/review`: Tạo một bài đánh giá mới.
-   `PUT /api/v1/review/:id`: Cập nhật một bài đánh giá.
-   `PUT /api/v1/review/:id/delete_review`: "Xóa mềm" một bài đánh giá.
-   `PUT /api/v1/review/:id/like`: Thích một bài đánh giá.
-   `PUT /api/v1/review/:id/dislike`: Bỏ thích một bài đánh giá.
-   `GET /api/v1/review/recent`: Lấy các bài đánh giá gần đây.
-   `GET /api/v1/review/all`: Lấy tất cả các bài đánh giá.

### 6.4. Phản hồi (Reply)

-   `GET /api/v1/reply`: Lấy danh sách các phản hồi.
-   `POST /api/v1/reply`: Tạo một phản hồi mới cho một bài đánh giá.
-   `PUT /api/v1/reply/:id`: Cập nhật một phản hồi.
-   `DELETE /api/v1/reply/:id`: Xóa một phản hồi.

### 6.5. Người dùng (User)

-   `GET /api/v1/user`: Lấy danh sách người dùng.
-   `GET /api/v1/user/:id`: Lấy thông tin chi tiết một người dùng.
-   `POST /api/v1/user`: Tạo người dùng mới (thường dành cho admin).
-   `PUT /api/v1/user/:id/delete_user`: "Xóa mềm" một người dùng.
-   `PUT /api/v1/user/:id/update_profile`: Cập nhật hồ sơ người dùng.
-   `PUT /api/v1/user/:id/update_role`: Cập nhật vai trò của người dùng.
-   `GET /api/v1/user/activity_stats`: Lấy thống kê hoạt động.
-   `GET /api/v1/user/recent_comments`: Lấy các bình luận gần đây của người dùng.
-   `GET /api/v1/user/my_reviews`: Lấy các bài đánh giá của người dùng hiện tại.
-   `GET /api/v1/user/all`: Lấy tất cả người dùng.
-   `GET /api/v1/user/stats`: Lấy thống kê về người dùng.

### 6.6. Vai trò (Role)

-   `GET /api/v1/role`: Lấy danh sách các vai trò.
-   `GET /api/v1/role/:id`: Lấy chi tiết một vai trò.
-   `POST /api/v1/role`: Tạo một vai trò mới.
-   `PUT /api/v1/role/:id`: Cập nhật một vai trò.
-   `PUT /api/v1/role/:id/delete_role`: "Xóa mềm" một vai trò.
-   `PUT /api/v1/role/:id/update_status`: Cập nhật trạng thái vai trò.
-   `PUT /api/v1/role/:id/update_permissions`: Cập nhật quyền cho một vai trò.
-   `GET /api/v1/role/available_permissions`: Lấy danh sách các quyền có sẵn trong hệ thống.

### 6.7. Yêu thích (Favorite)

-   `GET /api/v1/favorite`: Lấy danh sách các công ty yêu thích của người dùng.
-   `POST /api/v1/favorite`: Thêm một công ty vào danh sách yêu thích.
-   `DELETE /api/v1/favorite/:id`: Xóa một công ty khỏi danh sách yêu thích.
-   `GET /api/v1/favorite/check/:company_id`: Kiểm tra xem một công ty có trong danh sách yêu thích hay không.

### 6.8. Thống kê (Stats) & Cấu hình (Site Config)

-   `GET /api/v1/stats`: Lấy thống kê công khai.
-   `GET /api/v1/stats/admin`: Lấy thống kê cho quản trị viên.
-   `GET /api/v1/stats/admin_activities`: Lấy danh sách hoạt động của quản trị viên.
-   `GET /api/v1/site_config`: Lấy danh sách cấu hình trang.
-   `PUT /api/v1/site_config/bulk_update`: Cập nhật hàng loạt cấu hình.
-   `GET /api/v1/site_config/public_configs`: Lấy các cấu hình công khai.

## 7. Mô Hình Dữ Liệu (Backend Models)

Dưới đây là mô tả các model chính trong backend và mối quan hệ giữa chúng.

### 7.1. User (Người dùng)

-   `app/models/user.rb`
-   Quản lý thông tin người dùng và xác thực.
-   Sử dụng `devise` và `devise-jwt` để xác thực.
-   **Mối quan hệ:**
    -   `belongs_to :role`: Mỗi người dùng thuộc về một vai trò (`Role`).
    -   `has_many :favorites`: Một người dùng có thể có nhiều mục yêu thích.
    -   `has_many :favorite_companies`: Các công ty được người dùng yêu thích.
    -   `has_many :reviews`: Một người dùng có thể viết nhiều bài đánh giá (được định nghĩa trong model `Review`).

### 7.2. Company (Công ty)

-   `app/models/company.rb`
-   Đại diện cho một công ty được đánh giá trên nền tảng.
-   **Mối quan hệ:**
    -   `has_many :reviews`: Một công ty có nhiều bài đánh giá.
    -   `has_many :favorites`: Một công ty có thể được nhiều người dùng yêu thích.
    -   `has_many :favorited_by_users`: Những người dùng đã yêu thích công ty này.

### 7.3. Review (Đánh giá)

-   `app/models/review.rb`
-   Đại diện cho một bài đánh giá về một công ty.
-   **Mối quan hệ:**
    -   `belongs_to :user`: Mỗi bài đánh giá được viết bởi một người dùng.
    -   `belongs_to :company`: Mỗi bài đánh giá thuộc về một công ty.
    -   `has_many :replies`: Một bài đánh giá có thể có nhiều phản hồi.
    -   `has_many :likes`: Một bài đánh giá có thể có nhiều lượt thích.

### 7.4. Role (Vai trò)

-   `app/models/role.rb`
-   Quản lý vai trò và quyền hạn của người dùng trong hệ thống.
-   Hệ thống có các vai trò mặc định (`user`, `admin`, `owner`) và có thể có các vai trò tùy chỉnh.
-   Cơ chế phân quyền (permissions) được lưu trong một trường JSON, cho phép kiểm tra quyền truy cập (`can?`) vào các tài nguyên (`resources`) khác nhau.
-   **Mối quan hệ:**
    -   `has_many :users`: Một vai trò có thể được gán cho nhiều người dùng.

### 7.5. Các Model Quan Trọng Khác

-   **Area (`area.rb`):** Được sử dụng cho kiến trúc multi-tenant, đại diện cho một "khu vực" dữ liệu riêng biệt.
-   **Reply (`reply.rb`):** Phản hồi cho một bài đánh giá (`Review`).
-   **Like (`like.rb`):** Lượt thích cho một bài đánh giá (`Review`).
-   **Favorite (`favorite.rb`):** Đánh dấu một công ty là yêu thích của người dùng.
-   **AdminActivity (`admin_activity.rb`):** Ghi lại các hoạt động của quản trị viên.
-   **SiteConfig (`site_config.rb`):** Lưu trữ các cấu hình chung cho trang web.

## 8. Cấu Trúc Frontend (React)

Phần frontend của dự án được xây dựng bằng React và Vite, nằm trong thư mục `/FE`. Dưới đây là cấu trúc các thư mục con quan trọng trong `/FE/src`:

-   `main.jsx`: Điểm khởi đầu của ứng dụng, nơi component `App` được render vào DOM.
-   `App.jsx`: Component gốc của ứng dụng, thường chứa bộ định tuyến (Router) và các provider chung (như Context).

-   `/pages`: Chứa các component tương ứng với các trang chính của ứng dụng (ví dụ: trang chủ, trang danh sách công ty, trang chi tiết bài đánh giá). React Router sẽ ánh xạ các URL tới các component này.

-   `/components`: Chứa các component UI có thể tái sử dụng trên nhiều trang khác nhau (ví dụ: nút bấm, ô nhập liệu, card hiển thị thông tin).

-   `/services`: Chứa logic để giao tiếp với API backend. Các tệp trong này thường xuất các hàm để gọi đến các endpoint cụ thể (ví dụ: `companyService.js`, `reviewService.js`).

-   `/contexts`: Chứa các React Context, được sử dụng để quản lý trạng thái toàn cục hoặc chia sẻ dữ liệu giữa các component mà không cần truyền props qua nhiều cấp (ví dụ: `AuthContext` để lưu thông tin người dùng đã đăng nhập).

-   `/hooks`: Chứa các custom hook để đóng gói và tái sử dụng logic có trạng thái (ví dụ: một hook `useFetch` để lấy dữ liệu từ API).

-   `/config`: Chứa các tệp cấu hình cho frontend, chẳng hạn như cấu hình Axios hoặc các hằng số.

-   `/assets`: Chứa các tài sản tĩnh như hình ảnh, icon, font chữ.

-   `/i18n`: Chứa các tệp dịch để hỗ trợ đa ngôn ngữ (quốc tế hóa - internationalization).
