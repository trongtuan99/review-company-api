import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyService } from '../services/companyService';
import './AllCompanies.css';

const AllCompanies = () => {
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
        setError(response.message || 'Không thể tải danh sách công ty');
      }
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải danh sách công ty');
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
        setError(response.message || 'Không thể tải danh sách công ty');
      }
    } catch (err) {
      setError(err.message || err.error || 'Không thể tải danh sách công ty');
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
    return <div className="loading">Đang tải...</div>;
  }

  if (error && companies.length === 0) {
    return (
      <div className="error">
        <p>{error}</p>
        <Link to="/" className="back-link">← Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="all-companies-container">
      <div className="page-header">
        <Link to="/" className="back-link">← Quay lại trang chủ</Link>
        <h1>Tất cả công ty</h1>
        <p className="page-subtitle">Tổng cộng {totalCount} công ty</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>🔍 Lọc theo</label>
          <select
            value={filterBy}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả công ty</option>
            <option value="highest_rated">⭐ Điểm đánh giá cao nhất</option>
            <option value="most_reviews">📝 Nhiều đánh giá nhất</option>
            <option value="most_liked">❤️ Được yêu thích nhất</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📊 Sắp xếp theo</label>
          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="created_at">🕐 Mới nhất</option>
              <option value="avg_score">⭐ Điểm đánh giá</option>
              <option value="total_reviews">📝 Số lượng đánh giá</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              title={sortOrder === 'desc' ? 'Giảm dần' : 'Tăng dần'}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>📍 Tìm theo địa điểm</label>
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Nhập địa điểm..."
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
            <p>Chưa có công ty nào</p>
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
                  <span>{company.total_reviews || 0} đánh giá</span>
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
            ‹ Trước
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
            Sau ›
          </button>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;

