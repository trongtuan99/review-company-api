import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Debounce timer ref
  const debounceTimer = useRef(null);
  const [searchInput, setSearchInput] = useState('');

  // Load companies when filter changes (except search - that uses debounce)
  useEffect(() => {
    loadCompanies();
  }, [filter.sortBy, filter.sortOrder, filter.page, filter.search]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (searchInput !== filter.search) {
        setFilter(prev => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const options = {
        page: filter.page,
        perPage: 10,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      };

      const response = await companyService.getCompanies(filter.search || null, options);
      setCompanies(response.data || []);
      setPagination({
        total: response.pagination?.total_count || 0,
        pages: response.pagination?.total_pages || 1,
      });
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handleSortChange = (sortBy) => {
    setFilter(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilter(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleAction = (company, action) => {
    setSelectedCompany(company);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedCompany || !modalAction) return;

    try {
      if (modalAction === 'delete') {
        await adminService.deleteCompany(selectedCompany.id);
      }
      await loadCompanies();
      setShowModal(false);
      setSelectedCompany(null);
      setModalAction(null);
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Co loi xay ra: ' + (error.message || 'Unknown error'));
    }
  };

  const getSortIcon = (column) => {
    if (filter.sortBy !== column) return '';
    return filter.sortOrder === 'desc' ? ' ↓' : ' ↑';
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Quan ly Companies</h1>
          <p>Quan ly thong tin cac cong ty trong he thong</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group search-group">
          <label>Tim kiem</label>
          <input
            type="text"
            placeholder="Tim theo ten cong ty..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Sap xep</label>
          <select
            value={`${filter.sortBy}-${filter.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilter(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
            }}
            className="filter-select"
          >
            <option value="created_at-desc">Moi nhat</option>
            <option value="created_at-asc">Cu nhat</option>
            <option value="avg_score-desc">Rating cao nhat</option>
            <option value="avg_score-asc">Rating thap nhat</option>
            <option value="total_reviews-desc">Nhieu reviews nhat</option>
            <option value="total_reviews-asc">It reviews nhat</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={loadCompanies}>
          Lam moi
        </button>
      </div>

      {/* Companies Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>Dang tai...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="empty-state">
            <span>🏢</span>
            <p>Khong co cong ty nao</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cong ty</th>
                <th>Nganh nghe</th>
                <th>Dia diem</th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('avg_score')}
                  style={{ cursor: 'pointer' }}
                >
                  Rating{getSortIcon('avg_score')}
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('total_reviews')}
                  style={{ cursor: 'pointer' }}
                >
                  Reviews{getSortIcon('total_reviews')}
                </th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>#{company.id}</td>
                  <td>
                    <div className="company-cell">
                      <div className="company-logo">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} />
                        ) : (
                          <span>🏢</span>
                        )}
                      </div>
                      <div className="company-info">
                        <Link to={`/companies/${company.id}`} className="company-name">
                          {company.name}
                        </Link>
                        {company.website && (
                          <span className="company-website">{company.website}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{company.industry || 'N/A'}</td>
                  <td>{company.main_office || company.location || 'N/A'}</td>
                  <td>
                    <span className="rating-badge">
                      ⭐ {company.avg_score?.toFixed(1) || company.average_rating?.toFixed(1) || 'N/A'}
                    </span>
                  </td>
                  <td>{company.total_reviews || company.reviews_count || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/companies/${company.id}`}
                        className="action-btn view"
                        title="Xem chi tiet"
                      >
                        👁️
                      </Link>
                      <button
                        className="action-btn delete"
                        onClick={() => handleAction(company, 'delete')}
                        title="Xoa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="admin-pagination">
          <button
            disabled={filter.page === 1}
            onClick={() => handlePageChange(filter.page - 1)}
          >
            ← Truoc
          </button>
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (filter.page <= 3) {
                pageNum = i + 1;
              } else if (filter.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = filter.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={filter.page === pageNum ? 'active' : ''}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            disabled={filter.page === pagination.pages}
            onClick={() => handlePageChange(filter.page + 1)}
          >
            Sau →
          </button>
          <span className="pagination-info">
            Trang {filter.page} / {pagination.pages} ({pagination.total} ket qua)
          </span>
        </div>
      )}

      {/* Confirm Modal */}
      {showModal && (
        <ConfirmModal
          isOpen={showModal}
          title="Xoa Cong ty"
          message={`Ban co chac muon xoa cong ty "${selectedCompany?.name}"? Tat ca reviews lien quan cung se bi xoa.`}
          confirmText="Xoa"
          cancelText="Huy"
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type="danger"
        />
      )}
    </div>
  );
};

export default AdminCompanies;
