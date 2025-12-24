import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: t('admin.dashboard'), exact: true },
    { path: '/admin/reviews', icon: '📝', label: t('admin.manageReviews') },
    { path: '/admin/users', icon: '👥', label: t('admin.manageUsers') },
    { path: '/admin/companies', icon: '🏢', label: t('admin.manageCompanies') },
    { path: '/admin/roles', icon: '🔑', label: t('admin.manageRoles') },
    { path: '/admin/contact-messages', icon: '📬', label: t('admin.contactMessages.nav') },
    { path: '/admin/configs', icon: '⚙️', label: t('admin.settings') || 'Cai dat' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <NavLink to="/">
            <span className="logo-icon">⭐</span>
            <span className="logo-text">ReviewCty</span>
          </NavLink>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {user?.first_name?.[0] || user?.email?.[0] || 'A'}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">
                {user?.first_name || 'Admin'}
              </span>
              <span className="admin-user-role">{t('admin.administrator')}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span> {t('nav.logout')}
          </button>
          <NavLink to="/" className="back-to-site-btn">
            <span>🌐</span> {t('admin.backToSite')}
          </NavLink>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
