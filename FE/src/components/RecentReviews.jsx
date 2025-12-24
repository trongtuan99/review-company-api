import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecentReviews } from '../hooks/useRecentReviews';
import './RecentReviews.css';

const RecentReviews = ({ limit = 10 }) => {
  const { t, i18n } = useTranslation();
  const { data: response, isLoading } = useRecentReviews(limit);

  const reviews = response?.data || [];

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return t('time.justNow');
    if (diffInSeconds < 3600) return t('time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="recent-reviews-sidebar">
        <h3>{t('components.recentReviews')}</h3>
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="recent-reviews-sidebar">
        <h3>{t('components.recentReviews')}</h3>
        <div className="empty-reviews">{t('review.noReviews')}</div>
      </div>
    );
  }

  return (
    <div className="recent-reviews-sidebar">
      <h3>{t('components.recentReviews')}</h3>
      <div className="recent-reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="recent-review-item">
            <div className="recent-review-header">
              <span className="review-role">
                {review.job_title || t('components.employee')}
              </span>
              <span className="review-time">{formatTimeAgo(review.created_at)}</span>
            </div>
            <div className="recent-review-company">
              <Link to={`/companies/${review.company_id}`}>
                {review.company?.name || t('admin.company')}
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
                <span className="review-author">{t('components.anonymous')}</span>
              ) : (
                <span className="review-author">{review.user_name || t('components.user')}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReviews;
