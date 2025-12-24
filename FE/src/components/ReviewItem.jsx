import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReviewMutations } from '../hooks/useReviewMutations';
import ReplyList from './ReplyList';
import CreateReplyForm from './CreateReplyForm';
import './ReviewItem.css';

const ReviewItem = ({ review, isAuthenticated, onUpdate, companyId }) => {
  const { t, i18n } = useTranslation();
  // Local override state - only used during mutation, null otherwise
  // Key prop from parent (review.id) should reset this component when review changes
  const [likeOverride, setLikeOverride] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyRefreshKey, setReplyRefreshKey] = useState(0);

  // Use override state if set, otherwise use props directly
  // Check if likeOverride exists (not null), then use all its values
  const currentReview = likeOverride ? {
    ...review,
    total_like: likeOverride.total_like,
    total_dislike: likeOverride.total_dislike,
    user_like_status: likeOverride.user_like_status,
  } : review;

  const handleMutationSuccess = useCallback((reviewId, reviewData) => {
    if (reviewData && reviewData.id === reviewId) {
      // Update override with server response, then clear after delay
      setLikeOverride({
        total_like: reviewData.total_like,
        total_dislike: reviewData.total_dislike,
        user_like_status: reviewData.user_like_status,
      });
      // Clear override after parent has time to update props
      setTimeout(() => {
        setLikeOverride(null);
      }, 500);
    }
    onUpdate?.();
  }, [onUpdate]);

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

    // Get current values (from override or props)
    const previousStatus = currentReview.user_like_status;
    const previousLike = currentReview.total_like || 0;
    const previousDislike = currentReview.total_dislike || 0;

    // Optimistic update
    if (previousStatus === 'like') {
      // Toggle off
      setLikeOverride({
        user_like_status: null,
        total_like: Math.max(0, previousLike - 1),
        total_dislike: previousDislike,
      });
    } else {
      // Toggle on
      setLikeOverride({
        user_like_status: 'like',
        total_like: previousLike + 1,
        total_dislike: previousStatus === 'dislike' ? Math.max(0, previousDislike - 1) : previousDislike,
      });
    }

    likeReview();
  };

  const handleDislike = () => {
    if (loading) return;

    // Get current values (from override or props)
    const previousStatus = currentReview.user_like_status;
    const previousLike = currentReview.total_like || 0;
    const previousDislike = currentReview.total_dislike || 0;

    // Optimistic update
    if (previousStatus === 'dislike') {
      // Toggle off
      setLikeOverride({
        user_like_status: null,
        total_like: previousLike,
        total_dislike: Math.max(0, previousDislike - 1),
      });
    } else {
      // Toggle on
      setLikeOverride({
        user_like_status: 'dislike',
        total_like: previousStatus === 'like' ? Math.max(0, previousLike - 1) : previousLike,
        total_dislike: previousDislike + 1,
      });
    }

    dislikeReview();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReviewContent = (content) => {
    if (!content) return null;

    // Parse content with special delimiters [PROS], [CONS], [ADVICE]
    // Also handle old markdown format **Ưu điểm:**, **Nhược điểm:**, **Lời khuyên cho ban lãnh đạo:**
    let mainContent = content;
    let pros = '';
    let cons = '';
    let advice = '';

    // Check for new format with delimiters
    if (content.includes('[PROS]') || content.includes('[CONS]') || content.includes('[ADVICE]')) {
      const prosMatch = content.match(/\[PROS\]\n?([\s\S]*?)(?=\[CONS\]|\[ADVICE\]|$)/);
      const consMatch = content.match(/\[CONS\]\n?([\s\S]*?)(?=\[PROS\]|\[ADVICE\]|$)/);
      const adviceMatch = content.match(/\[ADVICE\]\n?([\s\S]*?)(?=\[PROS\]|\[CONS\]|$)/);

      if (prosMatch) pros = prosMatch[1].trim();
      if (consMatch) cons = consMatch[1].trim();
      if (adviceMatch) advice = adviceMatch[1].trim();

      // Get main content (before any delimiter)
      mainContent = content.split(/\[PROS\]|\[CONS\]|\[ADVICE\]/)[0].trim();
    }
    // Check for old markdown format
    else if (content.includes('**Ưu điểm:**') || content.includes('**Nhược điểm:**') || content.includes('**Lời khuyên')) {
      const prosMatch = content.match(/\*\*Ưu điểm:\*\*\n?([\s\S]*?)(?=\*\*Nhược điểm:\*\*|\*\*Lời khuyên.*?\*\*|$)/);
      const consMatch = content.match(/\*\*Nhược điểm:\*\*\n?([\s\S]*?)(?=\*\*Ưu điểm:\*\*|\*\*Lời khuyên.*?\*\*|$)/);
      const adviceMatch = content.match(/\*\*Lời khuyên.*?\*\*\n?([\s\S]*?)(?=\*\*Ưu điểm:\*\*|\*\*Nhược điểm:\*\*|$)/);

      if (prosMatch) pros = prosMatch[1].trim();
      if (consMatch) cons = consMatch[1].trim();
      if (adviceMatch) advice = adviceMatch[1].trim();

      // Get main content (before any section marker)
      mainContent = content.split(/\*\*Ưu điểm:\*\*|\*\*Nhược điểm:\*\*|\*\*Lời khuyên/)[0].trim();
    }

    const hasSections = pros || cons || advice;

    return (
      <div className="review-content-formatted">
        {mainContent && <p className="main-content">{mainContent}</p>}
        {hasSections && (
          <div className="review-sections">
            {pros && (
              <div className="review-section pros">
                <span className="section-label">👍 {t('review.pros')}</span>
                <p>{pros}</p>
              </div>
            )}
            {cons && (
              <div className="review-section cons">
                <span className="section-label">👎 {t('review.cons')}</span>
                <p>{cons}</p>
              </div>
            )}
            {advice && (
              <div className="review-section advice">
                <span className="section-label">💡 {t('review.advice')}</span>
                <p>{advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
            <span className="anonymous-badge">🔒 {t('components.anonymous')}</span>
          ) : (
            <span className="review-author">👤 {currentReview.user_name || t('components.user')}</span>
          )}
          {currentReview.created_at && (
            <span className="review-date">{formatDate(currentReview.created_at)}</span>
          )}
        </div>
      </div>

      <div className="review-content">
        {currentReview.reviews_content
          ? formatReviewContent(currentReview.reviews_content)
          : <p>{t('components.noReviewContent')}</p>
        }
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
          💬 {currentReview.total_reply || 0} {t('components.replies')}
        </button>
        {isAuthenticated && (
          <button
            className="action-btn"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            {showReplyForm ? t('common.cancel') : t('components.reply')}
          </button>
        )}
      </div>

      {showReplyForm && isAuthenticated && (
        <CreateReplyForm
          reviewId={currentReview.id}
          onSuccess={() => {
            setShowReplyForm(false);
            setShowReplies(true);
            // Force refresh by incrementing key - ensures ReplyList remounts and fetches fresh data
            setReplyRefreshKey(prev => prev + 1);
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
          />
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
