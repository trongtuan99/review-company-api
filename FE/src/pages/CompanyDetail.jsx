import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCompany, useReviews, useFavoriteStatus, useFavoriteMutations } from '../hooks';
import ReviewList from '../components/ReviewList';
import CreateReviewForm from '../components/CreateReviewForm';
import './CompanyDetail.css';

const CompanyDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showReviewForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showReviewForm]);

  // Filter states
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Build filters object
  const filters = useMemo(() => {
    const f = {};

    // Score filter
    if (scoreFilter === 'high') {
      f.minScore = 8;
    } else if (scoreFilter === 'medium') {
      f.minScore = 5;
      f.maxScore = 7;
    } else if (scoreFilter === 'low') {
      f.maxScore = 4;
    }

    // Sort filter
    if (sortBy === 'newest') {
      f.sortBy = 'created_at';
      f.sortOrder = 'desc';
    } else if (sortBy === 'oldest') {
      f.sortBy = 'created_at';
      f.sortOrder = 'asc';
    } else if (sortBy === 'highest') {
      f.sortBy = 'score';
      f.sortOrder = 'desc';
    } else if (sortBy === 'lowest') {
      f.sortBy = 'score';
      f.sortOrder = 'asc';
    }

    return f;
  }, [scoreFilter, sortBy]);

  const {
    data: companyResponse,
    isLoading: companyLoading,
    error: companyError,
    refetch: refetchCompany
  } = useCompany(id);

  const {
    data: reviewsResponse,
    isLoading: reviewsLoading,
    refetch: refetchReviews
  } = useReviews(id, 1, filters);

  const {
    data: favoriteStatusResponse,
    refetch: refetchFavoriteStatus
  } = useFavoriteStatus(id, isAuthenticated);

  const { addFavoriteAsync, removeFavoriteAsync, isAdding, isRemoving } = useFavoriteMutations();

  let company = null;
  if (companyResponse) {
    if (companyResponse.data && typeof companyResponse.data === 'object' && companyResponse.data.id) {
      company = companyResponse.data;
    } else if (companyResponse.id) {
      company = companyResponse;
    }
  }

  let reviews = [];
  let reviewsPagination = null;
  if (reviewsResponse) {
    if (Array.isArray(reviewsResponse.data)) {
      reviews = reviewsResponse.data;
    } else if (Array.isArray(reviewsResponse)) {
      reviews = reviewsResponse;
    }
    if (reviewsResponse.pagination) {
      reviewsPagination = reviewsResponse.pagination;
    }
  }

  const isFavorited = favoriteStatusResponse?.data?.is_favorited || false;
  const loading = companyLoading || reviewsLoading;
  const hasError = companyError || (companyResponse?.status && companyResponse?.status !== 'ok' && companyResponse?.status !== 'success');
  const error = hasError ? (companyError?.message || companyResponse?.message || t('common.error')) : '';
  const favoriteLoading = isAdding || isRemoving;

  const handleReviewCreated = () => {
    setShowReviewForm(false);
    refetchReviews();
    refetchCompany();
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert(t('auth.pleaseLoginToFavorite'));
      return;
    }

    try {
      if (isFavorited) {
        await removeFavoriteAsync(id);
      } else {
        await addFavoriteAsync(id);
      }
      refetchFavoriteStatus();
    } catch (err) {
      alert(err.message || t('company.cannotUpdateFavorite'));
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (hasError && error) {
    return (
      <div className="company-detail-container">
        <Link to="/" className="back-link">← {t('common.back')}</Link>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!company && !loading && !companyLoading) {
    return (
      <div className="company-detail-container">
        <Link to="/" className="back-link">← {t('common.back')}</Link>
        <div className="error">{t('company.notFound')}</div>
      </div>
    );
  }

  if (!company || companyLoading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="company-detail-container">
      <Link to="/" className="back-link">← {t('common.back')}</Link>

      <div className="company-header">
        <div className="company-header-content">
          {company.logo && (
            <div className="company-logo">
              <img src={company.logo} alt={`${company.name} logo`} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}
          <div className="company-header-info">
            <div className="company-title-section">
              <h1>{company?.name || 'N/A'}</h1>
              {isAuthenticated && (
                <button
                  className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  title={isFavorited ? t('company.removeFromFavorites') : t('company.addToFavorites')}
                >
                  {isFavorited ? '❤️' : '🤍'} {isFavorited ? t('company.favorited') : t('company.addToFavorites')}
                </button>
              )}
            </div>
            <div className="company-meta">
              <div className="score-badge">
                ⭐ {company.avg_score?.toFixed(1) || '0.0'}
              </div>
              <span>{company.total_reviews || 0} {t('common.reviews')}</span>
              {company.industry && <span className="company-industry">{company.industry}</span>}
              {company.founded_year && <span className="company-founded">{t('company.founded')}: {company.founded_year}</span>}
              {company.is_hiring && <span className="hiring-badge">🔥 {t('company.hiring')}</span>}
            </div>
            {company.description && (
              <p className="company-description">{company.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="company-stats">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{company.avg_score?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">{t('company.avgScore')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{company.total_reviews || 0}</div>
            <div className="stat-label">{t('company.totalReviews')}</div>
          </div>
        </div>
        <div className="stat-card recommend-card">
          <div className="stat-icon">👍</div>
          <div className="stat-content">
            <div className="stat-value">{company.recommend_rate ? `${Math.round(company.recommend_rate)}%` : 'N/A'}</div>
            <div className="stat-label">{t('company.recommendFriends')}</div>
          </div>
        </div>
      </div>

      {/* Detailed Ratings Section */}
      {(company.avg_work_environment || company.avg_salary_benefits || company.avg_management || company.avg_work_pressure || company.avg_culture) && (
        <div className="detailed-ratings-section">
          <h3 className="info-section-title">{t('company.detailedRatings')}</h3>
          <div className="ratings-grid">
            {company.avg_work_environment > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-label">
                  <span className="rating-bar-icon">🏢</span>
                  <span>{t('review.workEnvironment')}</span>
                </div>
                <div className="rating-bar-container">
                  <div className="rating-bar" style={{ width: `${(company.avg_work_environment / 10) * 100}%` }}></div>
                </div>
                <span className="rating-bar-value">{company.avg_work_environment?.toFixed(1)}</span>
              </div>
            )}
            {company.avg_salary_benefits > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-label">
                  <span className="rating-bar-icon">💰</span>
                  <span>{t('review.salaryBenefits')}</span>
                </div>
                <div className="rating-bar-container">
                  <div className="rating-bar" style={{ width: `${(company.avg_salary_benefits / 10) * 100}%` }}></div>
                </div>
                <span className="rating-bar-value">{company.avg_salary_benefits?.toFixed(1)}</span>
              </div>
            )}
            {company.avg_management > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-label">
                  <span className="rating-bar-icon">👔</span>
                  <span>{t('review.management')}</span>
                </div>
                <div className="rating-bar-container">
                  <div className="rating-bar" style={{ width: `${(company.avg_management / 10) * 100}%` }}></div>
                </div>
                <span className="rating-bar-value">{company.avg_management?.toFixed(1)}</span>
              </div>
            )}
            {company.avg_work_pressure > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-label">
                  <span className="rating-bar-icon">⏰</span>
                  <span>{t('review.workPressure')}</span>
                </div>
                <div className="rating-bar-container">
                  <div className="rating-bar" style={{ width: `${(company.avg_work_pressure / 10) * 100}%` }}></div>
                </div>
                <span className="rating-bar-value">{company.avg_work_pressure?.toFixed(1)}</span>
              </div>
            )}
            {company.avg_culture > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-label">
                  <span className="rating-bar-icon">🎯</span>
                  <span>{t('review.culture')}</span>
                </div>
                <div className="rating-bar-container">
                  <div className="rating-bar" style={{ width: `${(company.avg_culture / 10) * 100}%` }}></div>
                </div>
                <span className="rating-bar-value">{company.avg_culture?.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="company-info">
        <h3 className="info-section-title">{t('company.companyInfo')}</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <div className="info-label">{t('company.owner')}</div>
              <div className="info-value">{company.owner}</div>
            </div>
          </div>
          {company.main_office && (
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <div className="info-label">{t('company.location')}</div>
                <div className="info-value">{company.main_office}</div>
              </div>
            </div>
          )}
          {company.phone && (
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <div className="info-label">{t('company.phone')}</div>
                <div className="info-value">{company.phone}</div>
              </div>
            </div>
          )}
          {company.website && (
            <div className="info-item">
              <div className="info-icon">🌐</div>
              <div className="info-content">
                <div className="info-label">{t('company.website')}</div>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="info-value link">
                  {company.website}
                </a>
              </div>
            </div>
          )}
          {company.employee_count_range && (
            <div className="info-item">
              <div className="info-icon">👥</div>
              <div className="info-content">
                <div className="info-label">{t('company.scale')}</div>
                <div className="info-value">{company.employee_count_range}</div>
              </div>
            </div>
          )}
          {company.tech_stack && (
            <div className="info-item full-width">
              <div className="info-icon">💻</div>
              <div className="info-content">
                <div className="info-label">{t('company.techStack')}</div>
                <div className="info-value tech-stack">{company.tech_stack}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h2>{t('company.reviews')} ({company.total_reviews || 0})</h2>
          {isAuthenticated && (
            <button
              className="btn-primary"
              onClick={() => setShowReviewForm(true)}
            >
              + {t('company.writeReview')}
            </button>
          )}
        </div>

        {/* Review Filters */}
        <div className="review-filters">
          <div className="filter-group">
            <label>{t('company.scoreFilter')}</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${scoreFilter === 'all' ? 'active' : ''}`}
                onClick={() => setScoreFilter('all')}
              >
                {t('company.all')}
              </button>
              <button
                className={`filter-btn ${scoreFilter === 'high' ? 'active' : ''}`}
                onClick={() => setScoreFilter('high')}
              >
                {t('company.high')}
              </button>
              <button
                className={`filter-btn ${scoreFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setScoreFilter('medium')}
              >
                {t('company.medium')}
              </button>
              <button
                className={`filter-btn ${scoreFilter === 'low' ? 'active' : ''}`}
                onClick={() => setScoreFilter('low')}
              >
                {t('company.low')}
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>{t('company.sortLabel')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">{t('company.newest')}</option>
              <option value="oldest">{t('company.oldest')}</option>
              <option value="highest">{t('company.highest')}</option>
              <option value="lowest">{t('company.lowest')}</option>
            </select>
          </div>
        </div>

        <ReviewList
          reviews={reviews}
          pagination={reviewsPagination}
          onUpdate={() => {
            refetchReviews();
            refetchCompany();
          }}
          companyId={id}
          filters={filters}
        />
      </div>

      {/* Review Form Modal */}
      {showReviewForm && isAuthenticated && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowReviewForm(false)}>×</button>
            <CreateReviewForm
              companyId={id}
              onSuccess={handleReviewCreated}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetail;
