import { useTranslation } from 'react-i18next';
import './Terms.css';

const Terms = () => {
  const { t, i18n } = useTranslation();
  const lastUpdatedDate = new Date('2025-12-23').toLocaleDateString(
    i18n.language === 'vi' ? 'vi-VN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>{t('pages.terms.title')}</h1>
        <p className="last-updated">{t('pages.terms.lastUpdated')}: {lastUpdatedDate}</p>

        <section className="terms-section">
          <h2>1. Giới thiệu</h2>
          <p>
            Chào mừng bạn đến với ReviewCompany. Bằng việc truy cập và sử dụng website của chúng tôi,
            bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Định nghĩa</h2>
          <ul>
            <li><strong>"Website"</strong> - Nền tảng ReviewCompany và tất cả các dịch vụ liên quan</li>
            <li><strong>"Người dùng"</strong> - Bất kỳ cá nhân nào truy cập hoặc sử dụng website</li>
            <li><strong>"Nội dung"</strong> - Bao gồm đánh giá, bình luận, hình ảnh và các thông tin khác</li>
            <li><strong>"Công ty"</strong> - Các tổ chức, doanh nghiệp được đánh giá trên nền tảng</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Quyền và trách nhiệm của người dùng</h2>
          <h3>3.1. Quyền của người dùng</h3>
          <ul>
            <li>Đăng ký tài khoản và sử dụng các tính năng của website</li>
            <li>Đăng tải đánh giá trung thực về các công ty</li>
            <li>Tìm kiếm và xem thông tin về các công ty</li>
            <li>Báo cáo nội dung vi phạm</li>
          </ul>

          <h3>3.2. Trách nhiệm của người dùng</h3>
          <ul>
            <li>Cung cấp thông tin chính xác khi đăng ký</li>
            <li>Bảo mật thông tin tài khoản</li>
            <li>Đăng tải nội dung trung thực, không xúc phạm</li>
            <li>Tuân thủ pháp luật Việt Nam</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. Nội dung đánh giá</h2>
          <p>Khi đăng đánh giá, người dùng cam kết:</p>
          <ul>
            <li>Đánh giá dựa trên trải nghiệm thực tế của bản thân</li>
            <li>Không đăng tải thông tin sai sự thật hoặc gây hiểu nhầm</li>
            <li>Không sử dụng ngôn ngữ thô tục, xúc phạm</li>
            <li>Không tiết lộ thông tin bí mật kinh doanh</li>
            <li>Không spam hoặc đăng nội dung quảng cáo</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Quyền sở hữu trí tuệ</h2>
          <p>
            Tất cả nội dung trên website, bao gồm logo, thiết kế, văn bản và hình ảnh đều thuộc
            quyền sở hữu của ReviewCompany hoặc các bên cấp phép. Người dùng không được sao chép,
            phân phối hoặc sử dụng cho mục đích thương mại mà không có sự đồng ý bằng văn bản.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Giới hạn trách nhiệm</h2>
          <p>
            ReviewCompany không chịu trách nhiệm về tính chính xác của các đánh giá do người dùng đăng tải.
            Chúng tôi chỉ cung cấp nền tảng để người dùng chia sẻ trải nghiệm và không xác minh
            tính xác thực của từng đánh giá.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Chấm dứt tài khoản</h2>
          <p>
            Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của người dùng nếu vi phạm
            các điều khoản sử dụng, bao gồm nhưng không giới hạn:
          </p>
          <ul>
            <li>Đăng tải nội dung vi phạm pháp luật</li>
            <li>Spam hoặc lạm dụng hệ thống</li>
            <li>Giả mạo danh tính</li>
            <li>Quấy rối người dùng khác</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>8. Thay đổi điều khoản</h2>
          <p>
            ReviewCompany có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi
            sẽ có hiệu lực ngay khi được đăng tải trên website. Việc tiếp tục sử dụng website
            sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
          </p>
        </section>

        <section className="terms-section">
          <h2>9. Liên hệ</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng, vui lòng liên hệ:
          </p>
          <ul>
            <li>Email: legal@reviewcompany.com</li>
            <li>Điện thoại: +84 123 456 789</li>
            <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Terms;
