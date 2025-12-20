import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/reviewService';
import ReviewItem from './ReviewItem';
import './ReviewList.css';

const ReviewList = ({ reviews: initialReviews, pagination: initialPagination, onUpdate, companyId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState(initialReviews || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState(initialPagination || null);

  useEffect(() => {
    if (initialReviews) {
      setReviews(initialReviews);
      setPage(1);
      if (initialPagination) {
        setPagination(initialPagination);
        setHasMore(1 < initialPagination.total_pages);
      } else {
        setHasMore(initialReviews.length >= 10);
      }
    } else {
      setReviews([]);
      setPage(1);
      setHasMore(false);
      setPagination(null);
    }
  }, [initialReviews, initialPagination]);

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await reviewService.getReviews(companyId, nextPage);
      
      if (response.status === 'ok' || response.status === 'success') {
        const newReviews = response.data || [];
        
        if (newReviews.length === 0) {
          setHasMore(false);
        } else {
          const existingIds = new Set(reviews.map(r => r.id));
          const uniqueNewReviews = newReviews.filter(r => !existingIds.has(r.id));
          
          if (uniqueNewReviews.length > 0) {
            setReviews(prev => [...prev, ...uniqueNewReviews]);
            setPage(nextPage);
          }
          
          if (response.pagination) {
            setPagination(response.pagination);
            if (nextPage >= response.pagination.total_pages) {
              setHasMore(false);
            } else {
              setHasMore(true);
            }
          } else {
            if (newReviews.length < 10) {
              setHasMore(false);
            } else {
              setHasMore(true);
            }
          }
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-reviews">
        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          isAuthenticated={isAuthenticated}
          onUpdate={onUpdate}
          companyId={companyId}
        />
      ))}
      
      {hasMore && (
        <div className="load-more-container">
          <button
            className="btn-load-more"
            onClick={loadMoreReviews}
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

