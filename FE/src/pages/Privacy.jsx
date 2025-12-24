import { useTranslation } from 'react-i18next';
import './Privacy.css';

const Privacy = () => {
  const { t, i18n } = useTranslation();
  const lastUpdatedDate = new Date('2025-12-23').toLocaleDateString(
    i18n.language === 'vi' ? 'vi-VN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>{t('pages.privacy.title')}</h1>
        <p className="last-updated">{t('pages.privacy.lastUpdated')}: {lastUpdatedDate}</p>

        <section className="privacy-section">
          <h2>1. Giới thiệu</h2>
          <p>
            ReviewCompany cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích
            cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng website.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Thông tin chúng tôi thu thập</h2>
          <h3>2.1. Thông tin bạn cung cấp</h3>
          <ul>
            <li>Tên, email khi đăng ký tài khoản</li>
            <li>Thông tin hồ sơ (tên hiển thị, ảnh đại diện)</li>
            <li>Nội dung đánh giá và bình luận</li>
            <li>Thông tin liên hệ khi gửi yêu cầu hỗ trợ</li>
          </ul>

          <h3>2.2. Thông tin tự động thu thập</h3>
          <ul>
            <li>Địa chỉ IP và thông tin thiết bị</li>
            <li>Loại trình duyệt và hệ điều hành</li>
            <li>Thời gian truy cập và trang đã xem</li>
            <li>Cookies và công nghệ theo dõi tương tự</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. Mục đích sử dụng thông tin</h2>
          <p>Chúng tôi sử dụng thông tin của bạn để:</p>
          <ul>
            <li>Cung cấp và duy trì dịch vụ</li>
            <li>Xác thực và quản lý tài khoản</li>
            <li>Cải thiện trải nghiệm người dùng</li>
            <li>Gửi thông báo về cập nhật và tính năng mới</li>
            <li>Phân tích và cải thiện website</li>
            <li>Ngăn chặn gian lận và bảo vệ an ninh</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Chia sẻ thông tin</h2>
          <p>Chúng tôi không bán thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp:</p>
          <ul>
            <li>Với sự đồng ý của bạn</li>
            <li>Để tuân thủ yêu cầu pháp lý</li>
            <li>Với các nhà cung cấp dịch vụ hỗ trợ hoạt động website</li>
            <li>Để bảo vệ quyền lợi của ReviewCompany và người dùng</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Bảo mật thông tin</h2>
          <p>Chúng tôi áp dụng các biện pháp bảo mật để bảo vệ thông tin của bạn:</p>
          <ul>
            <li>Mã hóa SSL/TLS cho tất cả kết nối</li>
            <li>Mã hóa mật khẩu với thuật toán bcrypt</li>
            <li>Giới hạn quyền truy cập dữ liệu nội bộ</li>
            <li>Giám sát và phát hiện hoạt động bất thường</li>
            <li>Sao lưu dữ liệu định kỳ</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Cookies</h2>
          <p>
            Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn. Cookies giúp chúng tôi:
          </p>
          <ul>
            <li>Ghi nhớ đăng nhập của bạn</li>
            <li>Lưu trữ tùy chọn cá nhân</li>
            <li>Phân tích cách bạn sử dụng website</li>
          </ul>
          <p>
            Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đúng.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Quyền của bạn</h2>
          <p>Bạn có quyền:</p>
          <ul>
            <li>Truy cập và xem thông tin cá nhân</li>
            <li>Chỉnh sửa thông tin không chính xác</li>
            <li>Yêu cầu xóa tài khoản và dữ liệu</li>
            <li>Từ chối nhận email marketing</li>
            <li>Xuất dữ liệu cá nhân</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>8. Lưu trữ dữ liệu</h2>
          <p>
            Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để cung cấp dịch vụ
            hoặc theo yêu cầu của pháp luật. Khi tài khoản bị xóa, dữ liệu cá nhân sẽ được
            xóa hoặc ẩn danh trong vòng 30 ngày.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. Thay đổi chính sách</h2>
          <p>
            Chúng tôi có thể cập nhật chính sách này theo thời gian. Các thay đổi quan trọng
            sẽ được thông báo qua email hoặc trên website.
          </p>
        </section>

        <section className="privacy-section">
          <h2>10. Liên hệ</h2>
          <p>Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:</p>
          <ul>
            <li>Email: privacy@reviewcompany.com</li>
            <li>Điện thoại: +84 123 456 789</li>
            <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
