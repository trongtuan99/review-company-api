import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
    { path: '/admin/reviews', icon: '📝', label: 'Quản lý Reviews' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý Users' },
    { path: '/admin/companies', icon: '🏢', label: 'Quản lý Companies' },
    { path: '/admin/roles', icon: '🔑', label: 'Quản lý Roles' },
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
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Đăng xuất
          </button>
          <NavLink to="/" className="back-to-site-btn">
            <span>🌐</span> Về trang chính
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
