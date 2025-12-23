import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompany, useReviews, useFavoriteStatus, useFavoriteMutations } from '../hooks';
import ReviewList from '../components/ReviewList';
import CreateReviewForm from '../components/CreateReviewForm';
import './CompanyDetail.css';

const CompanyDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

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
  const error = hasError ? (companyError?.message || companyResponse?.message || 'Có lỗi xảy ra') : '';
  const favoriteLoading = isAdding || isRemoving;

  const handleReviewCreated = () => {
    setShowReviewForm(false);
    refetchReviews();
    refetchCompany();
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để yêu thích công ty');
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
      alert(err.message || 'Không thể cập nhật yêu thích');
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (hasError && error) {
    return (
      <div className="company-detail-container">
        <Link to="/" className="back-link">← Quay lại</Link>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!company && !loading && !companyLoading) {
    return (
      <div className="company-detail-container">
        <Link to="/" className="back-link">← Quay lại</Link>
        <div className="error">Không tìm thấy công ty</div>
      </div>
    );
  }

  if (!company || companyLoading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="company-detail-container">
      <Link to="/" className="back-link">← Quay lại</Link>
      
      <div className="company-header">
        <div className="company-title-section">
          <h1>{company?.name || 'N/A'}</h1>
          {isAuthenticated && (
            <button
              className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              title={isFavorited ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              {isFavorited ? '❤️' : '🤍'} {isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
            </button>
          )}
        </div>
        <div className="company-meta">
          <div className="score-badge">
            ⭐ {company.avg_score?.toFixed(1) || '0.0'}
          </div>
          <span>{company.total_reviews || 0} đánh giá</span>
        </div>
      </div>

      <div className="company-stats">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{company.avg_score?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">Điểm đánh giá</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{company.total_reviews || 0}</div>
            <div className="stat-label">Tổng đánh giá</div>
          </div>
        </div>
        <div className="stat-card recommend-card">
          <div className="stat-icon">👍</div>
          <div className="stat-content">
            <div className="stat-value">{company.recommend_rate ? `${Math.round(company.recommend_rate)}%` : 'N/A'}</div>
            <div className="stat-label">Khuyên bạn bè</div>
          </div>
        </div>
      </div>

      {/* Detailed Ratings Section */}
      {(company.avg_work_environment || company.avg_salary_benefits || company.avg_management || company.avg_work_pressure || company.avg_culture) && (
        <div className="detailed-ratings-section">
          <h3 className="info-section-title">Đánh giá chi tiết</h3>
          <div className="ratings-grid">
            {company.avg_work_environment > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-label">
                  <span className="rating-bar-icon">🏢</span>
                  <span>Môi trường làm việc</span>
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
                  <span>Lương & phúc lợi</span>
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
                  <span>Sếp & quản lý</span>
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
                  <span>Áp lực công việc</span>
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
                  <span>Văn hóa công ty</span>
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
        <h3 className="info-section-title">Thông tin công ty</h3>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <div className="info-label">Chủ sở hữu</div>
              <div className="info-value">{company.owner}</div>
            </div>
          </div>
          {company.main_office && (
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <div className="info-label">Văn phòng</div>
                <div className="info-value">{company.main_office}</div>
              </div>
            </div>
          )}
          {company.phone && (
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <div className="info-label">Điện thoại</div>
                <div className="info-value">{company.phone}</div>
              </div>
            </div>
          )}
          {company.website && (
            <div className="info-item">
              <div className="info-icon">🌐</div>
              <div className="info-content">
                <div className="info-label">Website</div>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="info-value link">
                  {company.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Đánh giá ({company.total_reviews || 0})</h2>
          {isAuthenticated && (
            <button
              className="btn-primary"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Hủy' : '+ Viết đánh giá'}
            </button>
          )}
        </div>

        {/* Review Filters */}
        <div className="review-filters">
          <div className="filter-group">
            <label>Điểm đánh giá:</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${scoreFilter === 'all' ? 'active' : ''}`}
                onClick={() => setScoreFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-btn ${scoreFilter === 'high' ? 'active' : ''}`}
                onClick={() => setScoreFilter('high')}
              >
                Cao (8-10)
              </button>
              <button
                className={`filter-btn ${scoreFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setScoreFilter('medium')}
              >
                Trung bình (5-7)
              </button>
              <button
                className={`filter-btn ${scoreFilter === 'low' ? 'active' : ''}`}
                onClick={() => setScoreFilter('low')}
              >
                Thấp (1-4)
              </button>
            </div>
          </div>
          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
            </select>
          </div>
        </div>

        {showReviewForm && isAuthenticated && (
          <CreateReviewForm
            companyId={id}
            onSuccess={handleReviewCreated}
            onCancel={() => setShowReviewForm(false)}
          />
        )}

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
    </div>
  );
};

export default CompanyDetail;

