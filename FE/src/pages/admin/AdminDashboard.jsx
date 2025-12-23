import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { reviewService } from '../../services/reviewService';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalReviews: 0,
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, recentReviewsRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        reviewService.getRecentReviews(5),
      ]);

      const statsData = statsRes.status === 'fulfilled' ? statsRes.value : null;
      const recentData = recentReviewsRes.status === 'fulfilled' ? recentReviewsRes.value : null;

      setStats({
        totalUsers: statsData?.data?.total_users || 0,
        totalCompanies: statsData?.data?.total_companies || 0,
        totalReviews: statsData?.data?.total_reviews || 0,
        recentReviews: recentData?.data || [],
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'blue',
      link: '/admin/users',
    },
    {
      title: 'Tổng Companies',
      value: stats.totalCompanies,
      icon: '🏢',
      color: 'green',
      link: '/admin/companies',
    },
    {
      title: 'Tổng Reviews',
      value: stats.totalReviews,
      icon: '📝',
      color: 'purple',
      link: '/admin/reviews',
    },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Dashboard</h1>
          <p>Tổng quan hệ thống quản lý Review Công Ty</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-refresh" onClick={loadDashboardData}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value.toLocaleString()}</h3>
              <p>{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2>Thao tác nhanh</h2>
        <div className="quick-actions">
          <Link to="/admin/reviews" className="quick-action-card">
            <span className="action-icon">📋</span>
            <span className="action-label">Quản lý Reviews</span>
          </Link>
          <Link to="/admin/companies" className="quick-action-card">
            <span className="action-icon">🏢</span>
            <span className="action-label">Quản lý Companies</span>
          </Link>
          <Link to="/admin/users" className="quick-action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">Quản lý Users</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-grid">
        <div className="admin-section">
          <div className="section-header">
            <h2>Reviews gần đây</h2>
            <Link to="/admin/reviews" className="view-all-link">Xem tất cả →</Link>
          </div>
          <div className="recent-list">
            {stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review.id} className="recent-item">
                  <div className="recent-item-icon">📝</div>
                  <div className="recent-item-content">
                    <h4>{review.title || 'Review không có tiêu đề'}</h4>
                    <p>{review.company?.name || 'Unknown Company'}</p>
                  </div>
                  <div className="recent-item-meta">
                    <span className={`status-badge ${review.status || 'approved'}`}>
                      {review.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>📭</span>
                <p>Chưa có reviews nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-section">
          <div className="section-header">
            <h2>Hoạt động hệ thống</h2>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-dot green"></span>
              <span>Hệ thống hoạt động bình thường</span>
            </div>
            <div className="activity-item">
              <span className="activity-dot blue"></span>
              <span>Database: Connected</span>
            </div>
            <div className="activity-item">
              <span className="activity-dot blue"></span>
              <span>API: Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
