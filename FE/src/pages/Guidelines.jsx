import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Guidelines.css';

const Guidelines = () => {
  const { t } = useTranslation();

  return (
    <div className="guidelines-page">
      <div className="guidelines-container">
        <h1>{t('pages.guidelines.title')}</h1>
        <p className="intro">{t('pages.guidelines.intro')}</p>

        <div className="cta-banner">
          <div className="cta-content">
            <h3>{t('pages.guidelines.ctaTitle')}</h3>
            <p>{t('pages.guidelines.ctaDesc')}</p>
          </div>
          <Link to="/write-review" className="cta-btn">{t('pages.guidelines.ctaBtn')}</Link>
        </div>

        <section className="guidelines-section">
          <div className="section-icon">✅</div>
          <h2>{t('pages.guidelines.doTitle')}</h2>
          <ul>
            <li>
              <strong>Đánh giá trung thực</strong>
              <p>Chia sẻ trải nghiệm thực tế của bạn khi làm việc tại công ty. Đánh giá chân thực giúp người đọc có cái nhìn đúng đắn về môi trường làm việc.</p>
            </li>
            <li>
              <strong>Cụ thể và chi tiết</strong>
              <p>Đề cập đến các khía cạnh cụ thể như văn hóa công ty, môi trường làm việc, cơ hội thăng tiến, chế độ lương thưởng, cân bằng công việc-cuộc sống.</p>
            </li>
            <li>
              <strong>Cân bằng ưu - nhược điểm</strong>
              <p>Không có công ty nào hoàn hảo. Nêu cả ưu điểm và nhược điểm để đánh giá khách quan, giúp người đọc có cái nhìn toàn diện.</p>
            </li>
            <li>
              <strong>Cập nhật và rõ ràng về thời gian</strong>
              <p>Đánh giá dựa trên trải nghiệm gần đây. Nêu rõ thời gian làm việc (VD: "Làm việc từ 2022-2024") để người đọc biết độ cập nhật.</p>
            </li>
            <li>
              <strong>Viết với mục đích giúp đỡ</strong>
              <p>Viết để giúp người khác đưa ra quyết định nghề nghiệp, không chỉ để phàn nàn hay khen ngợi một chiều.</p>
            </li>
            <li>
              <strong>Đưa ra lời khuyên cụ thể</strong>
              <p>Chia sẻ lời khuyên cho người muốn ứng tuyển hoặc đề xuất cho ban lãnh đạo công ty.</p>
            </li>
          </ul>
        </section>

        <section className="guidelines-section">
          <div className="section-icon">❌</div>
          <h2>{t('pages.guidelines.dontTitle')}</h2>
          <ul>
            <li>
              <strong>Thông tin sai sự thật</strong>
              <p>Không bịa đặt, phóng đại hoặc xuyên tạc thông tin. Đánh giá sai sự thật có thể gây hại cho công ty và người tìm việc.</p>
            </li>
            <li>
              <strong>Ngôn ngữ xúc phạm, thiếu văn minh</strong>
              <p>Tránh chửi bới, lăng mạ, ngôn từ thô tục hoặc mang tính phân biệt đối xử. Giữ thái độ chuyên nghiệp.</p>
            </li>
            <li>
              <strong>Tiết lộ thông tin bảo mật</strong>
              <p>Không chia sẻ bí mật kinh doanh, thông tin cá nhân của đồng nghiệp, hoặc dữ liệu nội bộ công ty.</p>
            </li>
            <li>
              <strong>Spam và quảng cáo</strong>
              <p>Không đăng nhiều đánh giá giống nhau, nội dung quảng cáo, hoặc link không liên quan.</p>
            </li>
            <li>
              <strong>Đánh giá giả mạo</strong>
              <p>Không tạo đánh giá cho công ty bạn chưa từng làm việc hoặc nhờ người khác viết đánh giá hộ.</p>
            </li>
            <li>
              <strong>Đánh giá vì mục đích cá nhân</strong>
              <p>Không viết đánh giá để trả thù cá nhân, cạnh tranh không lành mạnh, hoặc theo yêu cầu của công ty.</p>
            </li>
          </ul>
        </section>

        <section className="guidelines-section tips">
          <div className="section-icon">💡</div>
          <h2>{t('pages.guidelines.tipsTitle')}</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h3>Tiêu đề thu hút</h3>
              <p>Tóm tắt ý kiến chính trong 5-10 từ. VD: "Môi trường năng động, cơ hội phát triển tốt"</p>
            </div>
            <div className="tip-card">
              <h3>Cấu trúc rõ ràng</h3>
              <p>Chia thành các phần: trải nghiệm chung, ưu điểm, nhược điểm, lời khuyên</p>
            </div>
            <div className="tip-card">
              <h3>Ví dụ cụ thể</h3>
              <p>Đưa ra các tình huống thực tế. VD: "Team building hàng quý", "Review lương 6 tháng/lần"</p>
            </div>
            <div className="tip-card">
              <h3>Chấm điểm hợp lý</h3>
              <p>Điểm số phải phản ánh đúng nội dung. Không cho 10 điểm nếu nêu nhiều nhược điểm</p>
            </div>
          </div>
        </section>

        <section className="guidelines-section">
          <div className="section-icon">⭐</div>
          <h2>{t('pages.guidelines.ratingGuide')}</h2>
          <div className="rating-guide">
            <div className="rating-item">
              <span className="rating-score bad">1-3</span>
              <div className="rating-desc">
                <strong>Không hài lòng</strong>
                <p>Trải nghiệm tiêu cực, nhiều vấn đề nghiêm trọng, không khuyến khích người khác ứng tuyển</p>
              </div>
            </div>
            <div className="rating-item">
              <span className="rating-score average">4-5</span>
              <div className="rating-desc">
                <strong>Tạm được</strong>
                <p>Trải nghiệm bình thường, có điểm tốt và không tốt, phù hợp với một số người</p>
              </div>
            </div>
            <div className="rating-item">
              <span className="rating-score good">6-7</span>
              <div className="rating-desc">
                <strong>Hài lòng</strong>
                <p>Trải nghiệm tích cực, môi trường làm việc tốt, có một số điểm cần cải thiện</p>
              </div>
            </div>
            <div className="rating-item">
              <span className="rating-score excellent">8-9</span>
              <div className="rating-desc">
                <strong>Rất hài lòng</strong>
                <p>Trải nghiệm rất tốt, môi trường làm việc tuyệt vời, ít điểm cần cải thiện</p>
              </div>
            </div>
            <div className="rating-item">
              <span className="rating-score perfect">10</span>
              <div className="rating-desc">
                <strong>Tuyệt vời</strong>
                <p>Trải nghiệm hoàn hảo, công ty lý tưởng, sẵn sàng giới thiệu cho mọi người</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guidelines-section">
          <div className="section-icon">⚖️</div>
          <h2>{t('pages.guidelines.reviewProcess')}</h2>
          <p>Mỗi đánh giá sẽ được xem xét để đảm bảo tuân thủ hướng dẫn:</p>
          <ol className="review-process">
            <li>
              <span className="step-number">1</span>
              <div>
                <strong>Gửi đánh giá</strong>
                <p>Bạn viết và gửi đánh giá</p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div>
                <strong>Kiểm tra tự động</strong>
                <p>Hệ thống kiểm tra spam và nội dung vi phạm</p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div>
                <strong>Xét duyệt (nếu cần)</strong>
                <p>Đội ngũ kiểm duyệt xem xét các trường hợp đặc biệt</p>
              </div>
            </li>
            <li>
              <span className="step-number">4</span>
              <div>
                <strong>Đăng tải</strong>
                <p>Đánh giá được hiển thị công khai</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="guidelines-section">
          <div className="section-icon">🚨</div>
          <h2>{t('pages.guidelines.reportTitle')}</h2>
          <p>{t('pages.guidelines.reportDesc')}</p>
        </section>
      </div>
    </div>
  );
};

export default Guidelines;
