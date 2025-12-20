import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { useFavorites, useFavoriteMutations, useUserActivityStats, useUserRecentComments } from '../hooks';
import ProtectedRoute from '../components/ProtectedRoute';
import ConfirmModal from '../components/ConfirmModal';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [companyIdToRemove, setCompanyIdToRemove] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites');

  const { data: favoritesResponse, isLoading: favoritesLoading, refetch: refetchFavorites } = useFavorites();
  const favoriteCompanies = favoritesResponse?.data || [];
  const { removeFavoriteAsync, isRemoving } = useFavoriteMutations();
  
  const { data: activityStatsResponse, refetch: refetchActivityStats } = useUserActivityStats();
  const activityStats = activityStatsResponse?.data || { reviews_count: 0, replies_count: 0, likes_count: 0 };
  
  const { data: recentCommentsResponse, refetch: refetchRecentComments } = useUserRecentComments(10);
  const recentComments = recentCommentsResponse?.data || [];
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      refetchActivityStats();
      refetchRecentComments();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      // Assuming we have a getProfile endpoint
      // For now, use the user from context
      setProfile(user);
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || ''
      });
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      alert('Cập nhật profile thành công!');
    } catch (err) {
      setError(err.message || 'Không thể cập nhật profile');
    }
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
      const errorMessage = err.response?.data?.message || err.message || err.error || 'Không thể xóa khỏi danh sách yêu thích';
      alert(errorMessage);
    } finally {
      setCompanyIdToRemove(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="profile-container">
        <div className="profile-header">
          <Link to="/" className="back-link">← Quay lại trang chủ</Link>
          <h1>Hồ sơ của tôi</h1>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profile?.first_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <h2>{profile?.first_name} {profile?.last_name}</h2>
              <p className="profile-email">{profile?.email}</p>
            </div>

            {!isEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <label>Họ và tên đệm</label>
                  <p>{profile?.first_name || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Tên</label>
                  <p>{profile?.last_name || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profile?.email || 'Chưa cập nhật'}</p>
                </div>
                <div className="info-item">
                  <label>Vai trò</label>
                  <p className="role-badge">{profile?.role?.name || 'Người dùng'}</p>
                </div>
                <div className="profile-actions">
                  <button
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa hồ sơ
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Họ và tên đệm *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên đệm"
                  />
                </div>
                <div className="form-group">
                  <label>Tên *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tên"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                    disabled
                  />
                  <small>Email không thể thay đổi</small>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        first_name: profile?.first_name || '',
                        last_name: profile?.last_name || '',
                        email: profile?.email || ''
                      });
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="profile-stats">
            <h3>Hoạt động của tôi</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{activityStats.reviews_count || 0}</div>
                <div className="stat-label">ĐÁNH GIÁ ĐÃ VIẾT</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{activityStats.replies_count || 0}</div>
                <div className="stat-label">BÌNH LUẬN ĐÃ VIẾT</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{activityStats.likes_count || 0}</div>
                <div className="stat-label">LƯỢT THÍCH</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{favoriteCompanies.length}</div>
                <div className="stat-label">CÔNG TY YÊU THÍCH</div>
              </div>
            </div>
          </div>

          <div className="profile-tabs-section">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                ❤️ Công ty yêu thích ({favoriteCompanies.length})
              </button>
              <button
                className={`profile-tab ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                💬 Bình luận gần đây ({recentComments.length})
              </button>
            </div>

            {activeTab === 'favorites' && (
              <div className="favorite-companies-section">
                {favoritesLoading ? (
                  <div className="loading">Đang tải...</div>
                ) : favoriteCompanies.length === 0 ? (
                  <div className="empty-favorites">
                    <p>Bạn chưa yêu thích công ty nào</p>
                    <Link to="/companies" className="browse-link">
                      Khám phá công ty →
                    </Link>
                  </div>
                ) : (
                  <div className="favorite-companies-grid">
                    {favoriteCompanies.map((company) => (
                      <div key={company.id} className="favorite-company-card">
                        <Link
                          to={`/companies/${company.id}`}
                          className="favorite-company-link"
                        >
                          <div className="favorite-company-header">
                            <h4>{company.name}</h4>
                            <div className="favorite-company-score">
                              ⭐ {company.avg_score?.toFixed(1) || '0.0'}
                            </div>
                          </div>
                          <div className="favorite-company-info">
                            <p>{company.total_reviews || 0} đánh giá</p>
                            {company.main_office && (
                              <p className="location">📍 {company.main_office}</p>
                            )}
                          </div>
                        </Link>
                        <button
                          className="remove-favorite-btn"
                          onClick={() => handleRemoveFavoriteClick(company.id)}
                          title="Xóa khỏi yêu thích"
                          disabled={isRemoving}
                        >
                          {isRemoving ? '...' : '✕'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="recent-comments-section">
                {recentComments.length === 0 ? (
                  <div className="empty-comments">
                    <p>Bạn chưa có bình luận nào</p>
                    <Link to="/companies" className="browse-link">
                      Khám phá công ty và bình luận →
                    </Link>
                  </div>
                ) : (
                  <div className="comments-list">
                    {recentComments.map((reply) => (
                      <div key={reply.id} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-meta">
                            <span className="comment-date">
                              {new Date(reply.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {reply.review && (
                              <Link
                                to={`/companies/${reply.review.company_id}`}
                                className="comment-company-link"
                              >
                                📝 {reply.review.title || 'Đánh giá'}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="comment-content">
                          <p>{reply.content}</p>
                        </div>
                        {reply.review && (
                          <Link
                            to={`/companies/${reply.review.company_id}`}
                            className="comment-view-link"
                          >
                            Xem đánh giá →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setCompanyIdToRemove(null);
          }}
          onConfirm={handleRemoveFavorite}
          title="Xóa khỏi danh sách yêu thích"
          message="Bạn có chắc chắn muốn xóa công ty này khỏi danh sách yêu thích?"
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
        />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;

