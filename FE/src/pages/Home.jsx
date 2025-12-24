import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { companyService } from '../services/companyService';
import { statsService } from '../services/statsService';
import { API_BASE_URL } from '../config/api';
import CreateCompanyForm from '../components/CreateCompanyForm';
import RecentReviews from '../components/RecentReviews';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [topCompanies, setTopCompanies] = useState([]);
  const [remainingCompanies, setRemainingCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total_users: 0, total_companies: 0, total_reviews: 0 });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCreateForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreateForm]);

  useEffect(() => {
    if (!isSearching) {
      loadAllCompanies();
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsService.getStats();
      if (response.status === 'ok' || response.status === 'success') {
        setStats(response.data);
      }
    } catch (err) {
      // Silent fail for stats
    }
  };

  useEffect(() => {
    if (!isSearching && filterType) {
      setPage(1);
      setLoading(true);
      loadRemainingCompanies().finally(() => setLoading(false));
    }
  }, [filterType]);

  useEffect(() => {
    if (!isSearching && page > 1) {
      setLoading(true);
      loadRemainingCompanies().finally(() => setLoading(false));
    }
  }, [page]);

  useEffect(() => {
    if (isSearching || topCompanies.length === 0 || isPaused) return;

    const totalSlides = Math.ceil(topCompanies.length / 3);
    if (totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [topCompanies.length, isSearching, isPaused]);

  const loadAllCompanies = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTopCompanies(), loadRemainingCompanies()]);
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopCompanies = async () => {
    try {
      const response = await companyService.getTopRatedCompanies();
      if (response.status === 'ok' || response.status === 'success') {
        setTopCompanies(response.data || []);
      }
    } catch (err) {
      // Silent fail for top companies
    }
  };

  const loadRemainingCompanies = async () => {
    try {
      const options = {
        page: page,
        perPage: 20,
        sortBy: filterType === 'top' ? 'avg_score' : 'created_at',
        sortOrder: 'desc',
      };

      if (filterType === 'top') {
        options.filterBy = 'highest_rated';
      }

      const response = await companyService.getCompanies(null, options);
      if (response.status === 'ok' || response.status === 'success') {
        setRemainingCompanies(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.total_pages || 1);
        }
      }
    } catch (err) {
      // Silent fail for remaining companies
    }
  };

  const loadCompanies = async (query = null) => {
    try {
      setLoading(true);
      setError('');
      const response = await companyService.getCompanies(query);

      if (response.status === 'ok' || response.status === 'success') {
        setCompanies(response.data || []);
      } else {
        setError(response.message || t('home.cannotLoadCompanies'));
      }
    } catch (err) {
      let errorMessage = t('home.cannotLoadCompanies');

      if (err.error === 'Network Error' || err.message?.includes('Network Error')) {
        errorMessage = err.message || t('errors.networkError');
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.error) {
        errorMessage = err.error;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setShowCreateForm(false);
      loadAllCompanies();
      return;
    }

    setIsSearching(true);
    setShowCreateForm(false);
    await loadCompanies(searchQuery);
  };

  const handleCompanyCreated = async (company) => {
    setShowCreateForm(false);
    setSearchQuery('');
    setIsSearching(false);
    await loadTopCompanies();
    await loadRemainingCompanies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAll = () => {
    setSearchQuery('');
    setIsSearching(false);
    setShowCreateForm(false);
    loadAllCompanies();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(topCompanies.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(topCompanies.length / 3)) % Math.ceil(topCompanies.length / 3));
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
        {(error.includes('Network Error') || error.includes('server')) ? (
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666', background: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>💡 {t('home.debugInfo')}</p>
            <p style={{ marginBottom: '5px' }}><strong>{t('home.currentUrl')}:</strong> <code style={{ background: '#e9ecef', padding: '2px 6px', borderRadius: '3px' }}>{API_BASE_URL}</code></p>
          </div>
        ) : null}
      </div>
    );
  }

  const formatEmployeeCount = (company) => {
    if (company.employee_count_range) {
      return company.employee_count_range;
    }
    if (company.employee_count_min && company.employee_count_max) {
      return `${company.employee_count_min} - ${company.employee_count_max} ${t('common.employees')}`;
    }
    return null;
  };

  const formatStatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K+`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-bg-decoration">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🏆</span>
            <span>{t('home.heroBadge')}</span>
          </div>
          <h1 className="hero-title">
            {t('home.heroTitle1')} <span className="highlight">{stats.total_reviews.toLocaleString()}+</span> {t('home.heroTitle2')}
            <br />{t('home.heroTitle3')} <span className="highlight">{stats.total_companies.toLocaleString()}</span> {t('home.heroTitle4')}
          </h1>
          <p className="hero-subtitle">
            {t('home.heroSubtitle1')}
            <br />{t('home.heroSubtitle2')}
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">{formatStatNumber(stats.total_reviews)}</span>
              <span className="stat-label">{t('home.statReviews')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">{formatStatNumber(stats.total_companies)}</span>
              <span className="stat-label">{t('home.statCompanies')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">{formatStatNumber(stats.total_users)}</span>
              <span className="stat-label">{t('home.statUsers')}</span>
            </div>
          </div>
        </div>
        <div className="hero-search">
          <form onSubmit={handleSearch} className="hero-search-form">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="hero-search-input"
              />
            </div>
            <button type="submit" className="hero-search-btn">
              <span className="btn-text">{t('home.searchButton')}</span>
              <span className="btn-icon">→</span>
            </button>
          </form>
          <div className="search-suggestions">
            <span className="suggestion-label">{t('home.popular')}</span>
            <button type="button" onClick={() => { setSearchQuery('FPT'); }} className="suggestion-tag">FPT</button>
            <button type="button" onClick={() => { setSearchQuery('Viettel'); }} className="suggestion-tag">Viettel</button>
            <button type="button" onClick={() => { setSearchQuery('VNG'); }} className="suggestion-tag">VNG</button>
            <button type="button" onClick={() => { setSearchQuery('Grab'); }} className="suggestion-tag">Grab</button>
          </div>
        </div>
      </div>

      {isSearching && companies.length === 0 && !loading && (
        <div className="no-results-section">
          <div className="no-results-message">
            <p>{t('home.noCompanyFound')} "<strong>{searchQuery}</strong>"</p>
            {isAuthenticated ? (
              <button
                className="btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                + {t('home.createNewCompany')}
              </button>
            ) : (
              <p className="login-prompt">
                <a href="/login">{t('nav.login')}</a> {t('home.loginToCreate')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateForm(false)}>×</button>
            <CreateCompanyForm
              searchQuery={searchQuery}
              onSuccess={handleCompanyCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {!isSearching && topCompanies.length > 0 && (
        <div className="top-companies-section">
          <div className="top-companies-header">
            <h2>🏆 {t('home.topCompaniesTitle')}</h2>
          </div>
          <div
            className="companies-slider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <button
              className="slider-btn prev-btn"
              onClick={prevSlide}
              aria-label="Previous"
            >
              ‹
            </button>
            <div className="slider-container">
              <div
                className="slider-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(topCompanies.length / 3) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="slider-slide">
                    {topCompanies.slice(slideIndex * 3, slideIndex * 3 + 3).map((company) => (
                      <Link
                        key={company.id}
                        to={`/companies/${company.id}`}
                        className="company-card featured"
                      >
                        <div className="company-badge">{t('home.topRated')}</div>
                        <div className="company-header">
                          <h3>{company.name}</h3>
                          <div className="company-score">
                            <span>⭐</span>
                            <span>{company.avg_score?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                        <div className="company-info">
                          <p className="company-owner">
                            <span className="icon">👤</span>
                            <span>{company.owner}</span>
                          </p>
                          <p className="company-reviews">
                            <span className="icon">📝</span>
                            <span>{company.total_reviews || 0} {t('common.reviews')}</span>
                          </p>
                          {company.main_office && (
                            <p className="company-location">
                              <span className="icon">📍</span>
                              <span>{company.main_office}</span>
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button
              className="slider-btn next-btn"
              onClick={nextSlide}
              aria-label="Next"
            >
              ›
            </button>
          </div>
          <div className="slider-dots">
            {Array.from({ length: Math.ceil(topCompanies.length / 3) }).map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {!isSearching && (
        <div className="main-content-layout">
          <div className="companies-main-section">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'recent' ? 'active' : ''}`}
                onClick={() => setFilterType('recent')}
              >
                {t('home.recentlyUpdated')}
              </button>
              <button
                className={`filter-btn ${filterType === 'top' ? 'active' : ''}`}
                onClick={() => setFilterType('top')}
              >
                {t('home.topCompanies')}
              </button>
            </div>

            <div className="companies-list">
              {(isSearching ? companies : remainingCompanies).length === 0 && !loading ? (
                <div className="empty-state">
                  {isSearching ? (
                    <p>{t('home.noCompanyFound')}</p>
                  ) : (
                    <p>{t('home.noCompanies')}</p>
                  )}
                </div>
              ) : (
                (isSearching ? companies : remainingCompanies).map((company) => (
                  <Link
                    key={company.id}
                    to={`/companies/${company.id}`}
                    className="company-list-item"
                  >
                    <div className="company-list-header">
                      <h3 className="company-list-name">{company.name}</h3>
                      <div className="company-list-rating">
                        <span className="rating-stars">⭐</span>
                        <span className="rating-value">{company.avg_score?.toFixed(1) || '0.0'}</span>
                        <span className="rating-separator">{t('common.star')}</span>
                        <span className="rating-separator">|</span>
                        <span className="review-count">{company.total_reviews || 0} {t('common.review')}</span>
                      </div>
                    </div>
                    <div className="company-list-info">
                      {company.industry && (
                        <span className="info-badge industry">{company.industry}</span>
                      )}
                      {formatEmployeeCount(company) && (
                        <span className="info-badge">{formatEmployeeCount(company)}</span>
                      )}
                      {company.main_office && (
                        <span className="info-badge location">📍 {company.main_office}</span>
                      )}
                      {company.is_hiring && (
                        <span className="hiring-badge">{t('home.urgentHiring')}</span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>

            {!isSearching && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹ {t('common.previous')}
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-page ${page === pageNum ? 'active' : ''}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {t('common.next')} ›
                </button>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <RecentReviews limit={10} />
          </div>
        </div>
      )}

      {isSearching && (
        <div className="main-content-layout">
          <div className="companies-main-section">
            <div className="companies-header">
              <h2>{t('home.searchResults')} ({companies.length})</h2>
            </div>
            <div className="companies-list">
              {companies.length === 0 && !loading ? (
                <div className="empty-state">
                  <p>{t('home.noCompanyFound')}</p>
                </div>
              ) : (
                companies.map((company) => (
                  <Link
                    key={company.id}
                    to={`/companies/${company.id}`}
                    className="company-list-item"
                  >
                    <div className="company-list-header">
                      <h3 className="company-list-name">{company.name}</h3>
                      <div className="company-list-rating">
                        <span className="rating-stars">⭐</span>
                        <span className="rating-value">{company.avg_score?.toFixed(1) || '0.0'}</span>
                        <span className="rating-separator">{t('common.star')}</span>
                        <span className="rating-separator">|</span>
                        <span className="review-count">{company.total_reviews || 0} {t('common.review')}</span>
                      </div>
                    </div>
                    <div className="company-list-info">
                      {company.industry && (
                        <span className="info-badge industry">{company.industry}</span>
                      )}
                      {formatEmployeeCount(company) && (
                        <span className="info-badge">{formatEmployeeCount(company)}</span>
                      )}
                      {company.main_office && (
                        <span className="info-badge location">📍 {company.main_office}</span>
                      )}
                      {company.is_hiring && (
                        <span className="hiring-badge">{t('home.urgentHiring')}</span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="sidebar-section">
            <RecentReviews limit={10} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
