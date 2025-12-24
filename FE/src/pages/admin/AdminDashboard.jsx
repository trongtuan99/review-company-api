import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService';
import { reviewService } from '../../services/reviewService';
import './Admin.css';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalReviews: 0,
    recentReviews: [],
    recentActivity: [],
    todayStats: { new_users: 0, new_reviews: 0, new_companies: 0 },
    weekStats: { new_users: 0, new_reviews: 0, new_companies: 0 },
    monthStats: { new_users: 0, new_reviews: 0, new_companies: 0 },
  });
  const [adminActivities, setAdminActivities] = useState([]);
  const [activityTab, setActivityTab] = useState('system'); // 'system' or 'admin'
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activityTab === 'admin') {
      loadAdminActivities();
    }
  }, [activityTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [adminStatsRes, recentReviewsRes] = await Promise.allSettled([
        adminService.getAdminStats(),
        reviewService.getRecentReviews(5),
      ]);

      const adminData = adminStatsRes.status === 'fulfilled' ? adminStatsRes.value : null;
      const recentData = recentReviewsRes.status === 'fulfilled' ? recentReviewsRes.value : null;

      setStats({
        totalUsers: adminData?.data?.total_users || 0,
        totalCompanies: adminData?.data?.total_companies || 0,
        totalReviews: adminData?.data?.total_reviews || 0,
        recentReviews: recentData?.data || [],
        recentActivity: adminData?.data?.recent_activity || [],
        todayStats: adminData?.data?.today || { new_users: 0, new_reviews: 0, new_companies: 0 },
        weekStats: adminData?.data?.this_week || { new_users: 0, new_reviews: 0, new_companies: 0 },
        monthStats: adminData?.data?.this_month || { new_users: 0, new_reviews: 0, new_companies: 0 },
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await adminService.getAdminActivities({ perPage: 10 });
      console.log('Admin activities response:', response);
      setAdminActivities(response?.data || []);
    } catch (error) {
      console.error('Error loading admin activities:', error);
      setAdminActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const formatTimeAgo = (timeString) => {
    const now = new Date();
    const time = new Date(timeString);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    return t('time.daysAgo', { count: diffDays });
  };

  const getActivityDotColor = (type) => {
    switch (type) {
      case 'user_registered': return 'blue';
      case 'review_created': return 'green';
      case 'company_added': return 'purple';
      default: return 'gray';
    }
  };

  const getAdminActionColor = (action) => {
    switch (action) {
      case 'create': return 'green';
      case 'update': return 'blue';
      case 'delete': return 'red';
      case 'restore': return 'purple';
      case 'update_status': return 'orange';
      case 'update_role': return 'blue';
      case 'update_permissions': return 'purple';
      default: return 'gray';
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      create: t('admin.actionCreate'),
      update: t('admin.actionUpdate'),
      delete: t('admin.actionDelete'),
      restore: t('admin.actionRestore'),
      update_status: t('admin.actionUpdateStatus'),
      update_role: t('admin.actionUpdateRole'),
      update_permissions: t('admin.actionUpdatePermissions'),
    };
    return labels[action] || action;
  };

  const statCards = [
    {
      title: t('admin.totalUsers'),
      value: stats.totalUsers,
      icon: '👥',
      color: 'blue',
      link: '/admin/users',
    },
    {
      title: t('admin.totalCompanies'),
      value: stats.totalCompanies,
      icon: '🏢',
      color: 'green',
      link: '/admin/companies',
    },
    {
      title: t('admin.totalReviews'),
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
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>{t('admin.dashboard')}</h1>
          <p>{t('admin.dashboardDesc')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-refresh" onClick={loadDashboardData}>
            🔄 {t('admin.refresh')}
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
        <h2>{t('admin.quickActions')}</h2>
        <div className="quick-actions">
          <Link to="/admin/reviews" className="quick-action-card">
            <span className="action-icon">📋</span>
            <span className="action-label">{t('admin.manageReviews')}</span>
          </Link>
          <Link to="/admin/companies" className="quick-action-card">
            <span className="action-icon">🏢</span>
            <span className="action-label">{t('admin.manageCompanies')}</span>
          </Link>
          <Link to="/admin/users" className="quick-action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">{t('admin.manageUsers')}</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-grid">
        <div className="admin-section">
          <div className="section-header">
            <h2>{t('admin.recentReviews')}</h2>
            <Link to="/admin/reviews" className="view-all-link">{t('common.viewAll')} →</Link>
          </div>
          <div className="recent-list">
            {stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review.id} className="recent-item">
                  <div className="recent-item-icon">📝</div>
                  <div className="recent-item-content">
                    <h4>{review.title || t('admin.noTitleReview')}</h4>
                    <p>{review.company?.name || 'Unknown Company'}</p>
                  </div>
                  <div className="recent-item-meta">
                    <span className={`status-badge ${review.status || 'approved'}`}>
                      {review.status === 'pending' ? t('admin.pending') : t('admin.approved')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span>📭</span>
                <p>{t('admin.noReviews')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="admin-section">
          <div className="section-header">
            <div className="activity-tabs">
              <button
                className={`activity-tab ${activityTab === 'system' ? 'active' : ''}`}
                onClick={() => setActivityTab('system')}
              >
                {t('admin.systemActivity')}
              </button>
              <button
                className={`activity-tab ${activityTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActivityTab('admin')}
              >
                {t('admin.adminActivity')}
              </button>
            </div>
          </div>

          {activityTab === 'system' ? (
            <div className="activity-list">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <span className={`activity-dot ${getActivityDotColor(activity.type)}`}></span>
                    <span className="activity-icon">{activity.icon}</span>
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-time">{formatTimeAgo(activity.time)}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state small">
                  <span>📭</span>
                  <p>{t('admin.noActivity')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="activity-list">
              {activitiesLoading ? (
                <div className="loading-inline">
                  <div className="loading-spinner small"></div>
                  <span>{t('common.loading')}</span>
                </div>
              ) : adminActivities.length > 0 ? (
                adminActivities.map((activity) => (
                  <div key={activity.id} className="activity-item admin-activity">
                    <span className={`activity-dot ${getAdminActionColor(activity.action)}`}></span>
                    <span className="activity-icon">{activity.icon}</span>
                    <div className="activity-details">
                      <span className="activity-message">
                        <strong>{activity.admin_name}</strong> {getActionLabel(activity.action)} {activity.resource_type}: {activity.resource_name}
                      </span>
                      <span className="activity-meta">
                        {activity.ip_address && <span className="activity-ip">{activity.ip_address}</span>}
                      </span>
                    </div>
                    <span className="activity-time">{formatTimeAgo(activity.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state small">
                  <span>📭</span>
                  <p>{t('admin.noAdminActivity')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
