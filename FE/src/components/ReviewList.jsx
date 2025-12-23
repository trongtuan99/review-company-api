import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/reviewService';
import ReviewItem from './ReviewItem';
import './ReviewList.css';

const ReviewList = ({ reviews: initialReviews, pagination: initialPagination, onUpdate, companyId, filters = {} }) => {
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

  // Client-side filtering and sorting as fallback
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Apply score filter
    if (filters.minScore !== undefined) {
      result = result.filter(r => r.score >= filters.minScore);
    }
    if (filters.maxScore !== undefined) {
      result = result.filter(r => r.score <= filters.maxScore);
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aVal, bVal;

        if (filters.sortBy === 'created_at') {
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
        } else if (filters.sortBy === 'score') {
          aVal = a.score || 0;
          bVal = b.score || 0;
        } else {
          return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bVal - aVal;
        } else {
          return aVal - bVal;
        }
      });
    }

    return result;
  }, [reviews, filters]);

  const loadMoreReviews = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await reviewService.getReviews(companyId, nextPage, 10, filters);
      
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

  // Show message if all reviews are filtered out
  if (filteredAndSortedReviews.length === 0) {
    return (
      <div className="empty-reviews">
        <p>Không có đánh giá nào phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {filteredAndSortedReviews.map((review) => (
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

