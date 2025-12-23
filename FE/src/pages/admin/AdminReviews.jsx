import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminReviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: searchParams.get('status') || 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Debounce timer ref
  const debounceTimer = useRef(null);
  const [searchInput, setSearchInput] = useState('');

  // Load reviews when filter changes (except search - that uses debounce)
  useEffect(() => {
    loadReviews();
  }, [filter.status, filter.sortBy, filter.sortOrder, filter.page, filter.search]);

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

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews(filter.page, 10, {
        status: filter.status,
        search: filter.search,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      });
      setReviews(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        pages: response.pagination?.total_pages || 1,
      });
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handleStatusChange = (status) => {
    setFilter(prev => ({ ...prev, status, page: 1 }));
    setSearchParams(status === 'all' ? {} : { status });
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

  const handleAction = (review, action) => {
    setSelectedReview(review);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedReview || !modalAction) return;

    try {
      if (modalAction === 'delete') {
        await adminService.deleteReview(selectedReview.id);
      }
      await loadReviews();
      setShowModal(false);
      setSelectedReview(null);
      setModalAction(null);
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Co loi xay ra: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Cho duyet', class: 'pending' },
      approved: { label: 'Da duyet', class: 'approved' },
      rejected: { label: 'Tu choi', class: 'rejected' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = (column) => {
    if (filter.sortBy !== column) return '';
    return filter.sortOrder === 'desc' ? ' ↓' : ' ↑';
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Quan ly Reviews</h1>
          <p>Duyet va quan ly cac danh gia cong ty</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Trang thai</label>
          <select
            value={filter.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tat ca</option>
            <option value="pending">Cho duyet</option>
            <option value="approved">Da duyet</option>
            <option value="rejected">Tu choi</option>
          </select>
        </div>
        <div className="filter-group search-group">
          <label>Tim kiem</label>
          <input
            type="text"
            placeholder="Tim theo tieu de, cong ty..."
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
            <option value="score-desc">Rating cao nhat</option>
            <option value="score-asc">Rating thap nhat</option>
            <option value="total_like-desc">Nhieu like nhat</option>
            <option value="total_like-asc">It like nhat</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={loadReviews}>
          Lam moi
        </button>
      </div>

      {/* Reviews Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>Dang tai...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>Khong co reviews nao</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tieu de</th>
                <th>Cong ty</th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('score')}
                  style={{ cursor: 'pointer' }}
                >
                  Rating{getSortIcon('score')}
                </th>
                <th>Trang thai</th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('total_like')}
                  style={{ cursor: 'pointer' }}
                >
                  Likes{getSortIcon('total_like')}
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('created_at')}
                  style={{ cursor: 'pointer' }}
                >
                  Ngay tao{getSortIcon('created_at')}
                </th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>#{review.id}</td>
                  <td>
                    <div className="review-title-cell">
                      <Link to={`/reviews/${review.id}`} className="title">
                        {review.title || 'Khong co tieu de'}
                      </Link>
                      <span className="preview">
                        {(review.reviews_content || review.content)?.substring(0, 50)}...
                      </span>
                    </div>
                  </td>
                  <td>
                    {review.company ? (
                      <Link to={`/companies/${review.company.id}`}>
                        {review.company.name}
                      </Link>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <span className="rating-badge">⭐ {review.score || review.overall_rating || review.rating || 'N/A'}</span>
                  </td>
                  <td>{getStatusBadge(review.status || 'approved')}</td>
                  <td>{review.total_like || 0}</td>
                  <td>{formatDate(review.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/reviews/${review.id}`}
                        className="action-btn view"
                        title="Xem chi tiet"
                      >
                        👁️
                      </Link>
                      <button
                        className="action-btn delete"
                        onClick={() => handleAction(review, 'delete')}
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
      {showModal && modalAction === 'delete' && (
        <ConfirmModal
          isOpen={showModal}
          title="Xoa Review"
          message={`Ban co chac muon xoa review "${selectedReview?.title || 'nay'}"?`}
          confirmText="Xoa"
          cancelText="Huy"
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type="danger"
        />
      )}

      {/* View Modal */}
      {showModal && modalAction === 'view' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedReview?.title || 'Chi tiet Review'}</h2>
            <div className="review-detail">
              <p><strong>Cong ty:</strong> {selectedReview?.company?.name}</p>
              <p><strong>Rating:</strong> ⭐ {selectedReview?.score || selectedReview?.overall_rating}</p>
              <p><strong>Trang thai:</strong> {getStatusBadge(selectedReview?.status)}</p>
              <p><strong>Noi dung:</strong></p>
              <div className="review-content">
                {selectedReview?.reviews_content || selectedReview?.content}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                Dong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
