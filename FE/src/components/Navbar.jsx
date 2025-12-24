import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
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
          {t('nav.brand')}
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop-menu">
          <Link to="/companies" className="navbar-link">
            {t('nav.allCompanies')}
          </Link>
          <Link to="/about" className="navbar-link">
            {t('nav.about')}
          </Link>
          <Link to="/faq" className="navbar-link">
            {t('nav.faq')}
          </Link>
          <LanguageSwitcher />
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
                    👤 {t('nav.profile')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="user-menu-item admin-link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      ⚙️ {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    className="user-menu-item"
                    onClick={handleLogout}
                  >
                    🚪 {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="navbar-link btn-primary">
                {t('nav.register')}
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
            {t('nav.allCompanies')}
          </Link>
          <Link
            to="/about"
            className="mobile-menu-item"
            onClick={() => setShowMenu(false)}
          >
            {t('nav.about')}
          </Link>
          <Link
            to="/faq"
            className="mobile-menu-item"
            onClick={() => setShowMenu(false)}
          >
            {t('nav.faq')}
          </Link>
          <div className="mobile-theme-toggle">
            <span>{t('nav.displayMode')}</span>
            <ThemeToggle />
          </div>
          <div className="mobile-language-toggle">
            <LanguageSwitcher />
          </div>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="mobile-menu-item"
                onClick={() => setShowMenu(false)}
              >
                {t('nav.profile')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="mobile-menu-item admin-link"
                  onClick={() => setShowMenu(false)}
                >
                  ⚙️ {t('nav.admin')}
                </Link>
              )}
              <button
                className="mobile-menu-item"
                onClick={handleLogout}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-menu-item"
                onClick={() => setShowMenu(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="mobile-menu-item btn-primary"
                onClick={() => setShowMenu(false)}
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
