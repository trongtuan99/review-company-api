import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites, useFavoriteMutations, useUserActivityStats, useUserRecentComments, useUserReviews } from '../hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import ConfirmModal from '../components/ConfirmModal';
import EditProfileModal from '../components/EditProfileModal';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [companyIdToRemove, setCompanyIdToRemove] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');

  // Refresh user data on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const { data: favoritesResponse, isLoading: favoritesLoading } = useFavorites();
  const favoriteCompanies = favoritesResponse?.data || [];
  const { removeFavoriteAsync, isRemoving } = useFavoriteMutations();

  const { data: activityStatsResponse } = useUserActivityStats();
  const activityStats = activityStatsResponse?.data || { reviews_count: 0, replies_count: 0, likes_count: 0 };

  const { data: recentCommentsResponse } = useUserRecentComments(10);
  const recentComments = recentCommentsResponse?.data || [];

  const { data: userReviewsResponse, isLoading: reviewsLoading, error: reviewsError, refetch: refetchUserReviews } = useUserReviews(1);
  const userReviews = userReviewsResponse?.data || [];

  // Debug: Log reviews data
  console.log('userReviewsResponse:', userReviewsResponse);
  console.log('reviewsError:', reviewsError);

  const handleProfileUpdate = (updatedUser) => {
    updateUser && updateUser(updatedUser);
  };

  const handleRemoveFavoriteClick = (companyId) => {
    setCompanyIdToRemove(companyId);
    setShowConfirmModal(true);
  };

  const handleRemoveFavorite = async () => {
    if (!companyIdToRemove) return;
    try {
      await removeFavoriteAsync(companyIdToRemove);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t('company.cannotUpdateFavorite');
      alert(errorMessage);
    } finally {
      setCompanyIdToRemove(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return t('auth.male');
      case 'female': return t('auth.female');
      case 'other': return t('auth.other');
      default: return t('auth.notUpdated');
    }
  };

  return (
    <ProtectedRoute>
      <div className="profile-page">
        {/* Compact Profile Header */}
        <div className="profile-hero">
          <div className="profile-hero-content">
            <div className="profile-user-info">
              <div className="avatar-circle">
                {user?.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <h1>{user?.first_name} {user?.last_name}</h1>
                <p className="user-email">{user?.email}</p>
                <span className="role-badge">{user?.role?.name || t('admin.users')}</span>
              </div>
            </div>
            <div className="profile-actions-top">
              <button className="btn-edit" onClick={() => setShowEditModal(true)}>
                {t('common.edit')}
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{activityStats.reviews_count || 0}</span>
              <span className="stat-label">{t('home.statReviews')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{activityStats.replies_count || 0}</span>
              <span className="stat-label">{t('review.comments')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{activityStats.likes_count || 0}</span>
              <span className="stat-label">{t('review.helpful')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{favoriteCompanies.length}</span>
              <span className="stat-label">{t('company.addToFavorites')}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Quick Info Card */}
          <div className="quick-info-card">
            <h3>{t('profile.myProfile')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t('auth.lastName')} {t('auth.firstName')}</span>
                <span className="info-value">{user?.first_name} {user?.last_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('auth.email')}</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('auth.gender')}</span>
                <span className="info-value">{getGenderLabel(user?.gender)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('admin.roles')}</span>
                <span className="info-value">{user?.role?.name || t('admin.users')}</span>
              </div>
            </div>
            <div className="quick-actions">
              <Link to="/write-review" className="quick-action-btn primary">
                {t('review.writeReview')}
              </Link>
              <Link to="/companies" className="quick-action-btn secondary">
                {t('nav.allCompanies')}
              </Link>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="profile-tabs-container">
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                {t('profile.myReviews')} ({userReviews.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                {t('profile.myFavorites')} ({favoriteCompanies.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                {t('review.comments')} ({recentComments.length})
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'reviews' && (
                <div className="reviews-tab">
                  {reviewsLoading ? (
                    <div className="loading-state">{t('common.loading')}</div>
                  ) : reviewsError ? (
                    <div className="empty-state">
                      <p>{t('common.cannotLoad')}: {reviewsError.message || t('common.unknownError')}</p>
                      <button onClick={() => refetchUserReviews()} className="cta-link">{t('common.retry')}</button>
                    </div>
                  ) : userReviews.length === 0 ? (
                    <div className="empty-state">
                      <p>{t('profile.noReviewsYet')}</p>
                      <Link to="/write-review" className="cta-link">{t('review.writeReview')} →</Link>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {userReviews.map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-card-header">
                            <Link to={`/companies/${review.company_id}`} className="company-name">
                              {review.company?.name || t('common.company')}
                            </Link>
                            <div className="review-score">⭐ {review.score}/10</div>
                          </div>
                          <h4 className="review-title">{review.title}</h4>
                          <p className="review-excerpt">
                            {review.reviews_content?.substring(0, 150)}
                            {review.reviews_content?.length > 150 ? '...' : ''}
                          </p>
                          <div className="review-card-footer">
                            <span className="review-date">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            <div className="review-stats">
                              <span>👍 {review.likes_count || 0}</span>
                              <span>👎 {review.dislikes_count || 0}</span>
                            </div>
                            {review.status && (
                              <span className={`status-badge ${review.status}`}>
                                {review.status === 'pending' && t('admin.statusPending')}
                                {review.status === 'approved' && t('admin.statusApproved')}
                                {review.status === 'rejected' && t('admin.statusRejected')}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="favorites-tab">
                  {favoritesLoading ? (
                    <div className="loading-state">{t('common.loading')}</div>
                  ) : favoriteCompanies.length === 0 ? (
                    <div className="empty-state">
                      <p>{t('profile.noFavoritesYet')}</p>
                      <Link to="/companies" className="cta-link">{t('nav.allCompanies')} →</Link>
                    </div>
                  ) : (
                    <div className="favorites-grid">
                      {favoriteCompanies.map((company) => (
                        <div key={company.id} className="favorite-card">
                          <Link to={`/companies/${company.id}`} className="favorite-link">
                            <div className="favorite-header">
                              <h4>{company.name}</h4>
                              <span className="favorite-score">⭐ {company.avg_score?.toFixed(1) || '0.0'}</span>
                            </div>
                            <div className="favorite-info">
                              <span>{company.total_reviews || 0} {t('common.reviews')}</span>
                              {company.main_office && <span>📍 {company.main_office}</span>}
                            </div>
                          </Link>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveFavoriteClick(company.id)}
                            disabled={isRemoving}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="comments-tab">
                  {recentComments.length === 0 ? (
                    <div className="empty-state">
                      <p>{t('profile.noCommentsYet')}</p>
                      <Link to="/companies" className="cta-link">{t('nav.allCompanies')} →</Link>
                    </div>
                  ) : (
                    <div className="comments-list">
                      {recentComments.map((reply) => (
                        <div key={reply.id} className="comment-card">
                          <div className="comment-header">
                            <span className="comment-date">
                              {new Date(reply.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            {reply.review && (
                              <Link to={`/companies/${reply.review.company_id}`} className="comment-review-link">
                                {reply.review.title || t('common.review')}
                              </Link>
                            )}
                          </div>
                          <p className="comment-content">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onUpdate={handleProfileUpdate}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setCompanyIdToRemove(null);
          }}
          onConfirm={handleRemoveFavorite}
          title={t('company.removeFromFavorites')}
          message={t('profile.confirmRemoveFavorite')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          type="danger"
        />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
