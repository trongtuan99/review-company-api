import { useState, useEffect } from 'react';
import { useReviewMutations } from '../hooks/useReviewMutations';
import ReplyList from './ReplyList';
import CreateReplyForm from './CreateReplyForm';
import './ReviewItem.css';

const ReviewItem = ({ review, isAuthenticated, onUpdate, companyId }) => {
  const [currentReview, setCurrentReview] = useState(review);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyRefreshKey, setReplyRefreshKey] = useState(0);
  const [reloadReplies, setReloadReplies] = useState(null);

  useEffect(() => {
    setCurrentReview(review);
  }, [review]);

  const handleMutationSuccess = (reviewId, reviewData) => {
    if (reviewData && reviewData.id === reviewId) {
      // Ensure we have all the necessary fields from server response
      setCurrentReview(prev => ({
        ...prev,
        ...reviewData,
        total_like: reviewData.total_like ?? prev.total_like,
        total_dislike: reviewData.total_dislike ?? prev.total_dislike,
        user_like_status: reviewData.user_like_status ?? prev.user_like_status,
      }));
    }
    onUpdate?.();
  };

  const { likeReview, dislikeReview, isLiking, isDisliking } = useReviewMutations(
    review.id,
    companyId,
    handleMutationSuccess
  );

  const liked = currentReview.user_like_status === 'like';
  const disliked = currentReview.user_like_status === 'dislike';
  const loading = isLiking || isDisliking;

  const handleLike = () => {
    if (loading) return;
    
    // Optimistic update
    const previousStatus = currentReview.user_like_status;
    const previousLike = currentReview.total_like || 0;
    const previousDislike = currentReview.total_dislike || 0;
    
    let newStatus = 'like';
    let newLike = previousLike;
    let newDislike = previousDislike;
    
    if (previousStatus === 'like') {
      // Toggle off
      newStatus = null;
      newLike = Math.max(0, previousLike - 1);
    } else {
      // Toggle on
      newStatus = 'like';
      if (previousStatus === 'dislike') {
        newDislike = Math.max(0, previousDislike - 1);
        newLike = previousLike + 1;
      } else {
        newLike = previousLike + 1;
      }
    }
    
    setCurrentReview({
      ...currentReview,
      user_like_status: newStatus,
      total_like: newLike,
      total_dislike: newDislike,
    });
    
    likeReview();
  };

  const handleDislike = () => {
    if (loading) return;
    
    // Optimistic update
    const previousStatus = currentReview.user_like_status;
    const previousLike = currentReview.total_like || 0;
    const previousDislike = currentReview.total_dislike || 0;
    
    let newStatus = 'dislike';
    let newLike = previousLike;
    let newDislike = previousDislike;
    
    if (previousStatus === 'dislike') {
      // Toggle off
      newStatus = null;
      newDislike = Math.max(0, previousDislike - 1);
    } else {
      // Toggle on
      newStatus = 'dislike';
      if (previousStatus === 'like') {
        newLike = Math.max(0, previousLike - 1);
        newDislike = previousDislike + 1;
      } else {
        newDislike = previousDislike + 1;
      }
    }
    
    setCurrentReview({
      ...currentReview,
      user_like_status: newStatus,
      total_like: newLike,
      total_dislike: newDislike,
    });
    
    dislikeReview();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="review-title-score">
          <h4>{currentReview.title}</h4>
          <div className="score-badge">⭐ {currentReview.score}/10</div>
        </div>
        <div className="review-meta">
          {currentReview.job_title && (
            <span className="job-title-badge">💼 {currentReview.job_title}</span>
          )}
          {currentReview.is_anonymous ? (
            <span className="anonymous-badge">🔒 Ẩn danh</span>
          ) : (
            <span className="review-author">👤 {currentReview.user_name || 'Người dùng'}</span>
          )}
          {currentReview.created_at && (
            <span className="review-date">{formatDate(currentReview.created_at)}</span>
          )}
        </div>
      </div>

      <div className="review-content">
        <p>{currentReview.reviews_content || 'Không có nội dung đánh giá.'}</p>
      </div>

      <div className="review-actions">
        {isAuthenticated && (
          <>
            <button
              className={`action-btn ${liked ? 'active' : ''}`}
              onClick={handleLike}
              disabled={loading}
            >
              👍 {currentReview.total_like || 0}
            </button>
            <button
              className={`action-btn ${disliked ? 'active' : ''}`}
              onClick={handleDislike}
              disabled={loading}
            >
              👎 {currentReview.total_dislike || 0}
            </button>
          </>
        )}
        <button
          className="action-btn"
          onClick={() => setShowReplies(!showReplies)}
        >
          💬 {currentReview.total_reply || 0} trả lời
        </button>
        {isAuthenticated && (
          <button
            className="action-btn"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? 'Hủy' : 'Trả lời'}
          </button>
        )}
      </div>

      {showReplyForm && isAuthenticated && (
        <CreateReplyForm
          reviewId={currentReview.id}
          onSuccess={async () => {
            setShowReplyForm(false);
            setShowReplies(true);
            setTimeout(() => {
              if (reloadReplies) {
                reloadReplies();
              } else {
                setReplyRefreshKey(prev => prev + 1);
              }
            }, 300);
            onUpdate?.();
          }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {showReplies && (
        <div className="replies-section">
          <ReplyList 
            key={`replies-${currentReview.id}-${replyRefreshKey}`}
            reviewId={currentReview.id} 
            refreshKey={replyRefreshKey}
            onMounted={setReloadReplies}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
