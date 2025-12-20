import { Link } from 'react-router-dom';
import { useRecentReviews } from '../hooks/useRecentReviews';
import './RecentReviews.css';

const RecentReviews = ({ limit = 10 }) => {
  const { data: response, isLoading } = useRecentReviews(limit);

  const reviews = response?.data || [];

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="recent-reviews-sidebar">
        <h3>Các review gần đây</h3>
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="recent-reviews-sidebar">
        <h3>Các review gần đây</h3>
        <div className="empty-reviews">Chưa có review nào</div>
      </div>
    );
  }

  return (
    <div className="recent-reviews-sidebar">
      <h3>Các review gần đây</h3>
      <div className="recent-reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="recent-review-item">
            <div className="recent-review-header">
              <span className="review-role">
                {review.job_title || 'Nhân viên'}
              </span>
              <span className="review-time">{formatTimeAgo(review.created_at)}</span>
            </div>
            <div className="recent-review-company">
              <Link to={`/companies/${review.company_id}`}>
                {review.company?.name || 'Công ty'}
              </Link>
            </div>
            <div className="recent-review-content">
              <p>{review.title}</p>
              <div className="review-excerpt">
                {review.reviews_content?.substring(0, 100)}
                {review.reviews_content?.length > 100 && '...'}
              </div>
            </div>
            <div className="recent-review-footer">
              <span className="review-score">⭐ {review.score}/10</span>
              {review.is_anonymous ? (
                <span className="review-author">Ẩn danh</span>
              ) : (
                <span className="review-author">{review.user_name || 'Người dùng'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReviews;

