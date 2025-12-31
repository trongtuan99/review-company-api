import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reviewService } from '../../services/reviewService';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminReviews = () => {
  const { t } = useTranslation();
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
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const handleUpdateStatus = async (reviewId, status) => {
    try {
      await adminService.updateReviewStatus(reviewId, status);
      setReviews(prevReviews => 
        prevReviews.map(r => r.id === reviewId ? { ...r, status: status } : r)
      );
    } catch (error) {
      console.error('Error updating review status:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: t('admin.pending'), class: 'pending' },
      approved: { label: t('admin.approved'), class: 'approved' },
      rejected: { label: t('admin.rejected'), class: 'rejected' },
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
          <h1>{t('admin.manageReviews')}</h1>
          <p>{t('admin.reviewAndManage')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>{t('admin.status')}</label>
          <select
            value={filter.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('admin.all')}</option>
            <option value="pending">{t('admin.pending')}</option>
            <option value="approved">{t('admin.approved')}</option>
            <option value="rejected">{t('admin.rejected')}</option>
          </select>
        </div>
        <div className="filter-group search-group">
          <label>{t('common.search')}</label>
          <input
            type="text"
            placeholder={t('admin.searchByTitleCompany')}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>{t('admin.sortBy')}</label>
          <select
            value={`${filter.sortBy}-${filter.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilter(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
            }}
            className="filter-select"
          >
            <option value="created_at-desc">{t('admin.newest')}</option>
            <option value="created_at-asc">{t('admin.oldest')}</option>
            <option value="score-desc">{t('admin.highestRating')}</option>
            <option value="score-asc">{t('admin.lowestRating')}</option>
            <option value="total_like-desc">{t('admin.mostLiked')}</option>
            <option value="total_like-asc">{t('admin.leastLiked')}</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={loadReviews}>
          {t('admin.refresh')}
        </button>
      </div>

      {/* Reviews Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>{t('admin.noReviews')}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('review.title')}</th>
                <th>{t('admin.company')}</th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('score')}
                  style={{ cursor: 'pointer' }}
                >
                  {t('admin.rating')}{getSortIcon('score')}
                </th>
                <th>{t('admin.status')}</th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('total_like')}
                  style={{ cursor: 'pointer' }}
                >
                  {t('admin.likes')}{getSortIcon('total_like')}
                </th>
                <th
                  className="sortable"
                  onClick={() => handleSortChange('created_at')}
                  style={{ cursor: 'pointer' }}
                >
                  {t('admin.createdAt')}{getSortIcon('created_at')}
                </th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>#{review.id}</td>
                  <td>
                    <div className="review-title-cell">
                      <Link to={`/reviews/${review.id}`} className="title">
                        {review.title || t('admin.noTitle')}
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
                  <td>
                    <select
                      value={review.status || 'approved'}
                      onChange={(e) => handleUpdateStatus(review.id, e.target.value)}
                      className="status-select"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">{t('admin.pending')}</option>
                      <option value="approved">{t('admin.approved')}</option>
                      <option value="rejected">{t('admin.rejected')}</option>
                    </select>
                  </td>
                  <td>{review.total_like || 0}</td>
                  <td>{formatDate(review.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/reviews/${review.id}`}
                        className="action-btn view"
                        title={t('admin.viewDetail')}
                      >
                        👁️
                      </Link>
                      <button
                        className="action-btn delete"
                        onClick={() => handleAction(review, 'delete')}
                        title={t('common.delete')}
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
            ← {t('common.previous')}
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
            {t('common.next')} →
          </button>
          <span className="pagination-info">
            {t('admin.page')} {filter.page} / {pagination.pages} ({pagination.total} {t('common.results')})
          </span>
        </div>
      )}

      {/* Confirm Modal */}
      {showModal && modalAction === 'delete' && (
        <ConfirmModal
          isOpen={showModal}
          title={t('admin.deleteReview')}
          message={`${t('admin.confirmDeleteReview')} "${selectedReview?.title || 'this'}"?`}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type="danger"
        />
      )}

      {/* View Modal */}
      {showModal && modalAction === 'view' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedReview?.title || t('admin.viewDetail')}</h2>
            <div className="review-detail">
              <p><strong>{t('admin.company')}:</strong> {selectedReview?.company?.name}</p>
              <p><strong>{t('admin.rating')}:</strong> ⭐ {selectedReview?.score || selectedReview?.overall_rating}</p>
              <p><strong>{t('admin.status')}:</strong> {getStatusBadge(selectedReview?.status)}</p>
              <p><strong>{t('review.content')}:</strong></p>
              <div className="review-content">
                {selectedReview?.reviews_content || selectedReview?.content}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
