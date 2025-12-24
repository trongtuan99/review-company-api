import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { companyService } from '../services/companyService';
import './AllCompanies.css';

const AllCompanies = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [location, setLocation] = useState('');
  const perPage = 20;

  useEffect(() => {
    loadCompanies();
  }, [filterBy, sortBy, sortOrder, location]);

  useEffect(() => {
    if (page === 1) {
      loadCompanies();
    } else {
      loadPageCompanies();
    }
  }, [page]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      
      const options = {
        page: 1,
        perPage,
        filterBy: filterBy || undefined,
        sortBy,
        sortOrder,
        location: location || undefined,
      };
      
      const response = await companyService.getCompanies(null, options);
      
      if (response.status === 'ok' || response.status === 'success') {
        setCompanies(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.total_pages || 1);
          setTotalCount(response.pagination.total_count || response.data?.length || 0);
        } else {
          setTotalCount(response.data?.length || 0);
        }
      } else {
        setError(response.message || t('home.cannotLoadCompanies'));
      }
    } catch (err) {
      setError(err.message || err.error || t('home.cannotLoadCompanies'));
    } finally {
      setLoading(false);
    }
  };

  const loadPageCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      
      const options = {
        page,
        perPage,
        filterBy: filterBy || undefined,
        sortBy,
        sortOrder,
        location: location || undefined,
      };
      
      const response = await companyService.getCompanies(null, options);
      
      if (response.status === 'ok' || response.status === 'success') {
        setCompanies(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.total_pages || 1);
          setTotalCount(response.pagination.total_count || 0);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(response.message || t('home.cannotLoadCompanies'));
      }
    } catch (err) {
      setError(err.message || err.error || t('home.cannotLoadCompanies'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilterBy(newFilter);
    setPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (loading && companies.length === 0) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error && companies.length === 0) {
    return (
      <div className="error">
        <p>{error}</p>
        <Link to="/" className="back-link">← {t('footer.home')}</Link>
      </div>
    );
  }

  return (
    <div className="all-companies-container">
      <div className="page-header">
        <Link to="/" className="back-link">← {t('footer.home')}</Link>
        <h1>{t('nav.allCompanies')}</h1>
        <p className="page-subtitle">{t('common.total')} {totalCount} {t('common.companies')}</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>🔍 {t('common.filterBy')}</label>
          <select
            value={filterBy}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('nav.allCompanies')}</option>
            <option value="highest_rated">⭐ {t('admin.highestRating')}</option>
            <option value="most_reviews">📝 {t('common.mostReviews')}</option>
            <option value="most_liked">❤️ {t('common.mostFavorited')}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📊 {t('admin.sortBy')}</label>
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="created_at">🕐 {t('admin.newest')}</option>
              <option value="avg_score">⭐ {t('company.avgScore')}</option>
              <option value="total_reviews">📝 {t('company.totalReviews')}</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? t('common.descending') : t('common.ascending')}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>📍 {t('common.searchByLocation')}</label>
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder={t('common.enterLocation')}
            className="filter-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="companies-grid">
        {companies.length === 0 ? (
          <div className="empty-state">
            <p>{t('home.noCompanies')}</p>
          </div>
        ) : (
          companies.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="company-card"
            >
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
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page - 1)}
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
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            {t('common.next')} ›
          </button>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;

