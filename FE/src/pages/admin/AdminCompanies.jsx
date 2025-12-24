import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminCompanies = () => {
  const { t, i18n } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    status: 'active', // 'active', 'deleted', 'all'
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Create/Edit form
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    phone: '',
    main_office: '',
    website: '',
    industry: '',
    logo: '',
    description: '',
    founded_year: '',
    tech_stack: '',
    employee_count_min: '',
    employee_count_max: '',
    is_hiring: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Debounce timer ref
  const debounceTimer = useRef(null);
  const [searchInput, setSearchInput] = useState('');

  // Load companies when filter changes
  useEffect(() => {
    loadCompanies();
  }, [filter.sortBy, filter.sortOrder, filter.page, filter.search, filter.status]);

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
      const response = await adminService.getAllCompanies({
        page: filter.page,
        perPage: 10,
        search: filter.search || undefined,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        status: filter.status,
      });
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

  const handleCreate = () => {
    setFormMode('create');
    setFormData({
      name: '',
      owner: '',
      phone: '',
      main_office: '',
      website: '',
      industry: '',
      logo: '',
      description: '',
      founded_year: '',
      tech_stack: '',
      employee_count_min: '',
      employee_count_max: '',
      is_hiring: false,
    });
    setShowFormModal(true);
  };

  const handleEdit = (company) => {
    setFormMode('edit');
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      owner: company.owner || '',
      phone: company.phone || '',
      main_office: company.main_office || '',
      website: company.website || '',
      industry: company.industry || '',
      logo: company.logo || '',
      description: company.description || '',
      founded_year: company.founded_year || '',
      tech_stack: company.tech_stack || '',
      employee_count_min: company.employee_count_min || '',
      employee_count_max: company.employee_count_max || '',
      is_hiring: company.is_hiring || false,
    });
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.owner) {
      alert(i18n.language === 'vi' ? 'Tên công ty và chủ sở hữu là bắt buộc' : 'Company name and owner are required');
      return;
    }

    try {
      setFormLoading(true);
      const submitData = { ...formData };
      // Convert empty strings to null for optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') submitData[key] = null;
      });
      // Convert numbers
      if (submitData.founded_year) submitData.founded_year = parseInt(submitData.founded_year);
      if (submitData.employee_count_min) submitData.employee_count_min = parseInt(submitData.employee_count_min);
      if (submitData.employee_count_max) submitData.employee_count_max = parseInt(submitData.employee_count_max);

      if (formMode === 'create') {
        await adminService.createCompany(submitData);
      } else {
        await adminService.updateCompany(selectedCompany.id, submitData);
      }
      setShowFormModal(false);
      setSelectedCompany(null);
      await loadCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    } finally {
      setFormLoading(false);
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
      } else if (modalAction === 'restore') {
        await adminService.restoreCompany(selectedCompany.id);
      }
      await loadCompanies();
      setShowModal(false);
      setSelectedCompany(null);
      setModalAction(null);
    } catch (error) {
      console.error('Error performing action:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilter(prev => ({ ...prev, page: newPage }));
    }
  };

  const getStatusBadge = (company) => {
    if (company.is_deleted) {
      return <span className="status-badge rejected">{i18n.language === 'vi' ? 'Đã xóa' : 'Deleted'}</span>;
    }
    return <span className="status-badge approved">{i18n.language === 'vi' ? 'Hoạt động' : 'Active'}</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>{t('admin.manageCompanies')}</h1>
          <p>{t('admin.companyManagement')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + {i18n.language === 'vi' ? 'Thêm công ty' : 'Add Company'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group search-group">
          <label>{t('common.search')}</label>
          <input
            type="text"
            placeholder={t('admin.searchByCompanyName')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>{i18n.language === 'vi' ? 'Trạng thái' : 'Status'}</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="filter-select"
          >
            <option value="active">{i18n.language === 'vi' ? 'Hoạt động' : 'Active'}</option>
            <option value="deleted">{i18n.language === 'vi' ? 'Đã xóa' : 'Deleted'}</option>
            <option value="all">{i18n.language === 'vi' ? 'Tất cả' : 'All'}</option>
          </select>
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
            <option value="name-asc">{i18n.language === 'vi' ? 'Tên A-Z' : 'Name A-Z'}</option>
            <option value="name-desc">{i18n.language === 'vi' ? 'Tên Z-A' : 'Name Z-A'}</option>
            <option value="avg_score-desc">{t('admin.highestRating')}</option>
            <option value="total_reviews-desc">{t('admin.mostReviews')}</option>
          </select>
        </div>
        <button className="btn-refresh" onClick={loadCompanies}>
          {t('admin.refresh')}
        </button>
      </div>

      {/* Companies Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="empty-state">
            <span>🏢</span>
            <p>{t('admin.noCompanies')}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.company')}</th>
                <th>{t('admin.industry')}</th>
                <th>{t('admin.location')}</th>
                <th>{t('admin.rating')}</th>
                <th>{t('admin.reviews')}</th>
                <th>{i18n.language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className={company.is_deleted ? 'deleted-row' : ''}>
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
                        <span className="company-owner">{company.owner}</span>
                      </div>
                    </div>
                  </td>
                  <td>{company.industry || '-'}</td>
                  <td>{company.main_office || '-'}</td>
                  <td>
                    <span className="rating-badge">
                      ⭐ {company.avg_score?.toFixed(1) || '-'}
                    </span>
                  </td>
                  <td>{company.total_reviews || 0}</td>
                  <td>{getStatusBadge(company)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/companies/${company.id}`}
                        className="action-btn view"
                        title={t('admin.viewDetail')}
                      >
                        👁️
                      </Link>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(company)}
                        title={t('common.edit')}
                      >
                        ✏️
                      </button>
                      {company.is_deleted ? (
                        <button
                          className="action-btn restore"
                          onClick={() => handleAction(company, 'restore')}
                          title={i18n.language === 'vi' ? 'Khôi phục' : 'Restore'}
                        >
                          ♻️
                        </button>
                      ) : (
                        <button
                          className="action-btn delete"
                          onClick={() => handleAction(company, 'delete')}
                          title={t('common.delete')}
                        >
                          🗑️
                        </button>
                      )}
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

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{formMode === 'create'
              ? (i18n.language === 'vi' ? 'Thêm công ty mới' : 'Add New Company')
              : (i18n.language === 'vi' ? 'Chỉnh sửa công ty' : 'Edit Company')
            }</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-row">
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Tên công ty' : 'Company Name'} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={formMode === 'edit'}
                  />
                </div>
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Chủ sở hữu' : 'Owner'} *</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Ngành nghề' : 'Industry'}</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Năm thành lập' : 'Founded Year'}</label>
                  <input
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Địa chỉ' : 'Location'}</label>
                  <input
                    type="text"
                    value={formData.main_office}
                    onChange={(e) => setFormData({ ...formData, main_office: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Điện thoại' : 'Phone'}</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://"
                  />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Quy mô (min)' : 'Size (min)'}</label>
                  <input
                    type="number"
                    value={formData.employee_count_min}
                    onChange={(e) => setFormData({ ...formData, employee_count_min: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>{i18n.language === 'vi' ? 'Quy mô (max)' : 'Size (max)'}</label>
                  <input
                    type="number"
                    value={formData.employee_count_max}
                    onChange={(e) => setFormData({ ...formData, employee_count_max: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{i18n.language === 'vi' ? 'Tech Stack' : 'Tech Stack'}</label>
                <input
                  type="text"
                  value={formData.tech_stack}
                  onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                  placeholder="React, Node.js, PostgreSQL..."
                />
              </div>

              <div className="form-group">
                <label>{i18n.language === 'vi' ? 'Mô tả' : 'Description'}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_hiring}
                    onChange={(e) => setFormData({ ...formData, is_hiring: e.target.checked })}
                  />
                  <span>🔥 {i18n.language === 'vi' ? 'Đang tuyển dụng' : 'Currently Hiring'}</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowFormModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading
                    ? (i18n.language === 'vi' ? 'Đang lưu...' : 'Saving...')
                    : (formMode === 'create'
                      ? (i18n.language === 'vi' ? 'Tạo công ty' : 'Create Company')
                      : (i18n.language === 'vi' ? 'Cập nhật' : 'Update')
                    )
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showModal && (
        <ConfirmModal
          isOpen={showModal}
          title={modalAction === 'delete'
            ? t('admin.deleteCompany')
            : (i18n.language === 'vi' ? 'Khôi phục công ty' : 'Restore Company')
          }
          message={modalAction === 'delete'
            ? `${t('admin.confirmDeleteCompany')} "${selectedCompany?.name}"?`
            : `${i18n.language === 'vi' ? 'Bạn có chắc muốn khôi phục công ty' : 'Are you sure you want to restore company'} "${selectedCompany?.name}"?`
          }
          confirmText={modalAction === 'delete' ? t('common.delete') : (i18n.language === 'vi' ? 'Khôi phục' : 'Restore')}
          cancelText={t('common.cancel')}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type={modalAction === 'delete' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
};

export default AdminCompanies;
