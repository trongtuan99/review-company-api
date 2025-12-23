import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Review Company
        </Link>
        
        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          <Link to="/companies" className="navbar-link">
            Tất cả công ty
          </Link>
          <Link to="/about" className="navbar-link">
            Về chúng tôi
          </Link>
          <Link to="/faq" className="navbar-link">
            FAQ
          </Link>
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="user-name">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="dropdown-icon">▼</span>
              </button>
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <Link
                    to="/profile"
                    className="user-menu-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 Hồ sơ của tôi
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="user-menu-item admin-link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      ⚙️ Quản trị Admin
                    </Link>
                  )}
                  <button
                    className="user-menu-item"
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="navbar-link btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Toggle menu"
        >
          {showMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="mobile-menu">
          <Link
            to="/companies"
            className="mobile-menu-item"
            onClick={() => setShowMenu(false)}
          >
            Tất cả công ty
          </Link>
          <Link
            to="/about"
            className="mobile-menu-item"
            onClick={() => setShowMenu(false)}
          >
            Về chúng tôi
          </Link>
          <Link
            to="/faq"
            className="mobile-menu-item"
            onClick={() => setShowMenu(false)}
          >
            FAQ
          </Link>
          <div className="mobile-theme-toggle">
            <span>Chế độ hiển thị</span>
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="mobile-menu-item"
                onClick={() => setShowMenu(false)}
              >
                Hồ sơ của tôi
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="mobile-menu-item admin-link"
                  onClick={() => setShowMenu(false)}
                >
                  ⚙️ Quản trị Admin
                </Link>
              )}
              <button
                className="mobile-menu-item"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-menu-item"
                onClick={() => setShowMenu(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="mobile-menu-item btn-primary"
                onClick={() => setShowMenu(false)}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

