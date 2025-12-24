import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/reviewService';
import './ReviewDetail.css';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data: reviewResponse, isLoading, error } = useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewService.getReviewById(id),
    enabled: !!id,
  });

  const review = reviewResponse?.data || reviewResponse;

  // Parse pros/cons/advice from content if using delimiters
  const parseContent = (content) => {
    if (!content) return { main: '', pros: '', cons: '', advice: '' };

    let main = content;
    let pros = '';
    let cons = '';
    let advice = '';

    if (content.includes('[PROS]')) {
      const parts = content.split('[PROS]');
      main = parts[0].trim();
      const remaining = parts[1] || '';

      if (remaining.includes('[CONS]')) {
        const consParts = remaining.split('[CONS]');
        pros = consParts[0].trim();
        const afterCons = consParts[1] || '';

        if (afterCons.includes('[ADVICE]')) {
          const adviceParts = afterCons.split('[ADVICE]');
          cons = adviceParts[0].trim();
          advice = adviceParts[1]?.trim() || '';
        } else {
          cons = afterCons.trim();
        }
      } else if (remaining.includes('[ADVICE]')) {
        const adviceParts = remaining.split('[ADVICE]');
        pros = adviceParts[0].trim();
        advice = adviceParts[1]?.trim() || '';
      } else {
        pros = remaining.trim();
      }
    } else if (content.includes('[CONS]')) {
      const parts = content.split('[CONS]');
      main = parts[0].trim();
      const remaining = parts[1] || '';

      if (remaining.includes('[ADVICE]')) {
        const adviceParts = remaining.split('[ADVICE]');
        cons = adviceParts[0].trim();
        advice = adviceParts[1]?.trim() || '';
      } else {
        cons = remaining.trim();
      }
    } else if (content.includes('[ADVICE]')) {
      const parts = content.split('[ADVICE]');
      main = parts[0].trim();
      advice = parts[1]?.trim() || '';
    }

    return { main, pros, cons, advice };
  };

  if (isLoading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error || !review) {
    return (
      <div className="review-detail-page">
        <div className="review-detail-container">
          <button onClick={() => navigate(-1)} className="back-link">
            ← {t('common.back')}
          </button>
          <div className="error">{t('review.notFound')}</div>
        </div>
      </div>
    );
  }

  const parsedContent = parseContent(review.reviews_content);
  const detailedRatings = [
    { key: 'work_environment_rating', label: t('review.workEnvironment'), icon: '🏢', value: review.work_environment_rating },
    { key: 'salary_benefits_rating', label: t('review.salaryBenefits'), icon: '💰', value: review.salary_benefits_rating },
    { key: 'management_rating', label: t('review.management'), icon: '👔', value: review.management_rating },
    { key: 'work_pressure_rating', label: t('review.workPressure'), icon: '⏰', value: review.work_pressure_rating },
    { key: 'culture_rating', label: t('review.culture'), icon: '🎯', value: review.culture_rating },
  ].filter(r => r.value > 0);

  return (
    <div className="review-detail-page">
      <div className="review-detail-container">
        <button onClick={() => navigate(-1)} className="back-link">
          ← {t('common.back')}
        </button>

        <div className="review-detail-card">
          {/* Header */}
          <div className="review-detail-header">
            <div className="review-company-info">
              <Link to={`/companies/${review.company_id}`} className="company-link">
                {review.company?.name || t('home.statCompanies')}
              </Link>
              {review.job_title && (
                <span className="job-title">{review.job_title}</span>
              )}
            </div>
            <div className="review-score-badge">
              ⭐ {review.score}/10
            </div>
          </div>

          {/* Title */}
          <h1 className="review-title">{review.title}</h1>

          {/* Meta */}
          <div className="review-meta">
            <span className="review-author">
              {review.is_anonymous ? t('review.anonymousUser') : `${review.user?.first_name || ''} ${review.user?.last_name || ''}`}
            </span>
            <span className="meta-separator">•</span>
            <span className="review-date">
              {new Date(review.created_at).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {review.employment_status && (
              <>
                <span className="meta-separator">•</span>
                <span className="employment-status">
                  {review.employment_status === 'current' ? t('review.currentEmployee') : t('review.formerEmployee')}
                </span>
              </>
            )}
            {review.employment_duration && (
              <>
                <span className="meta-separator">•</span>
                <span className="employment-duration">
                  {review.employment_duration === 'less_than_1' && t('review.lessThan1Year')}
                  {review.employment_duration === '1_to_3' && t('review.oneToThreeYears')}
                  {review.employment_duration === 'more_than_3' && t('review.moreThan3Years')}
                </span>
              </>
            )}
          </div>

          {/* Recommend Badge */}
          {review.would_recommend !== undefined && (
            <div className={`recommend-badge ${review.would_recommend ? 'positive' : 'negative'}`}>
              {review.would_recommend ? `👍 ${t('review.wouldRecommend')}` : `👎 ${t('review.wouldNotRecommend')}`}
            </div>
          )}

          {/* Detailed Ratings */}
          {detailedRatings.length > 0 && (
            <div className="detailed-ratings-box">
              <h3>{t('review.detailedRatings')}</h3>
              <div className="ratings-list">
                {detailedRatings.map((rating) => (
                  <div key={rating.key} className="rating-item">
                    <span className="rating-icon">{rating.icon}</span>
                    <span className="rating-label">{rating.label}</span>
                    <div className="rating-bar-wrapper">
                      <div
                        className="rating-bar-fill"
                        style={{ width: `${(rating.value / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="rating-value">{rating.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="review-content-section">
            <h3>{t('review.overallExperience')}</h3>
            <p className="review-content">{parsedContent.main}</p>
          </div>

          {/* Pros */}
          {parsedContent.pros && (
            <div className="review-content-section pros-section">
              <h3>✅ {t('review.pros')}</h3>
              <p>{parsedContent.pros}</p>
            </div>
          )}

          {/* Cons */}
          {parsedContent.cons && (
            <div className="review-content-section cons-section">
              <h3>❌ {t('review.cons')}</h3>
              <p>{parsedContent.cons}</p>
            </div>
          )}

          {/* Advice */}
          {parsedContent.advice && (
            <div className="review-content-section advice-section">
              <h3>💡 {t('review.advice')}</h3>
              <p>{parsedContent.advice}</p>
            </div>
          )}

          {/* Stats */}
          <div className="review-stats">
            <div className="stat-item">
              <span className="stat-icon">👍</span>
              <span>{review.likes_count || 0} {t('review.helpful')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💬</span>
              <span>{review.replies_count || 0} {t('review.comments')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="review-actions">
            <Link to={`/companies/${review.company_id}`} className="btn-primary">
              {t('review.viewCompany')}
            </Link>
            {isAuthenticated && (
              <Link to={`/write-review?company=${review.company_id}`} className="btn-secondary">
                {t('review.writeReview')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
