import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const RESOURCES = ['users', 'companies', 'reviews', 'roles', 'dashboard', 'settings'];
const ACTIONS = ['read', 'create', 'update', 'delete', 'approve'];

const AdminRoles = () => {
  const { t, i18n } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Create/Edit form
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allow_all_action: false,
    permissions: {}
  });
  const [formLoading, setFormLoading] = useState(false);

  // Permissions modal
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsRole, setPermissionsRole] = useState(null);
  const [permissionsData, setPermissionsData] = useState({});
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  const getResourceLabels = () => ({
    users: i18n.language === 'vi' ? 'Nguoi dung' : 'Users',
    companies: i18n.language === 'vi' ? 'Cong ty' : 'Companies',
    reviews: i18n.language === 'vi' ? 'Danh gia' : 'Reviews',
    roles: i18n.language === 'vi' ? 'Vai tro' : 'Roles',
    dashboard: 'Dashboard',
    settings: i18n.language === 'vi' ? 'Cai dat' : 'Settings'
  });

  const getActionLabels = () => ({
    read: i18n.language === 'vi' ? 'Xem' : 'Read',
    create: i18n.language === 'vi' ? 'Tao' : 'Create',
    update: i18n.language === 'vi' ? 'Sua' : 'Update',
    delete: i18n.language === 'vi' ? 'Xoa' : 'Delete',
    approve: i18n.language === 'vi' ? 'Duyet' : 'Approve'
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormMode('create');
    setFormData({
      name: '',
      description: '',
      allow_all_action: false,
      permissions: {
        companies: ['read'],
        reviews: ['read']
      }
    });
    setShowFormModal(true);
  };

  const handleEdit = (role) => {
    setFormMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name || role.display_name || role.role,
      description: role.description || '',
      allow_all_action: role.allow_all_action || false,
      permissions: role.permissions || {}
    });
    setShowFormModal(true);
  };

  const handleManagePermissions = (role) => {
    setPermissionsRole(role);
    setPermissionsData(role.permissions || {});
    setShowPermissionsModal(true);
  };

  const handleDelete = (role) => {
    setSelectedRole(role);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleStatusChange = async (role, newStatus) => {
    try {
      await adminService.updateRoleStatus(role.id, newStatus);
      await loadRoles();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert(t('admin.roleRequired'));
      return;
    }

    try {
      setFormLoading(true);
      if (formMode === 'create') {
        await adminService.createRole(formData);
      } else {
        await adminService.updateRole(selectedRole.id, formData);
      }
      setShowFormModal(false);
      setSelectedRole(null);
      await loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!permissionsRole) return;

    try {
      setPermissionsLoading(true);
      await adminService.updateRolePermissions(permissionsRole.id, permissionsData);
      setShowPermissionsModal(false);
      setPermissionsRole(null);
      await loadRoles();
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    } finally {
      setPermissionsLoading(false);
    }
  };

  const togglePermission = (resource, action) => {
    setPermissionsData(prev => {
      const current = prev[resource] || [];
      const newActions = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];

      if (newActions.length === 0) {
        const { [resource]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [resource]: newActions };
    });
  };

  const toggleFormPermission = (resource, action) => {
    setFormData(prev => {
      const current = prev.permissions[resource] || [];
      const newActions = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];

      const newPermissions = { ...prev.permissions };
      if (newActions.length === 0) {
        delete newPermissions[resource];
      } else {
        newPermissions[resource] = newActions;
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  const confirmAction = async () => {
    if (!selectedRole || modalAction !== 'delete') return;

    try {
      await adminService.deleteRole(selectedRole.id);
      setShowModal(false);
      setSelectedRole(null);
      setModalAction(null);
      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert(t('admin.errorOccurred') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: t('admin.active'), class: 'approved' },
      inactive: { label: t('admin.inactive'), class: 'pending' },
      deleted: { label: t('admin.deleted'), class: 'rejected' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const getPermissionsSummary = (role) => {
    if (role.allow_all_action) return i18n.language === 'vi' ? 'Toan quyen' : 'Full Access';
    if (!role.permissions || Object.keys(role.permissions).length === 0) {
      return i18n.language === 'vi' ? 'Khong co quyen' : 'No permissions';
    }

    const count = Object.values(role.permissions).reduce((acc, actions) => acc + actions.length, 0);
    return `${count} ${i18n.language === 'vi' ? 'quyen' : 'permissions'}`;
  };

  const RESOURCE_LABELS = getResourceLabels();
  const ACTION_LABELS = getActionLabels();

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>{t('admin.manageRoles')}</h1>
          <p>{t('admin.roleAndPermission')}</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + {t('admin.addRole')}
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="empty-state">
            <span>🔑</span>
            <p>{t('admin.noRoles')}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.roleName')}</th>
                <th>{t('admin.description')}</th>
                <th>{t('admin.permissions')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {role.display_name || role.name || role.role}
                    </strong>
                    {role.role && role.role !== 'custom' && (
                      <span className="role-type-badge">{role.role}</span>
                    )}
                  </td>
                  <td>
                    <span className="role-description">{role.description || '-'}</span>
                  </td>
                  <td>
                    <button
                      className="permissions-summary-btn"
                      onClick={() => handleManagePermissions(role)}
                    >
                      {getPermissionsSummary(role)}
                      <span className="edit-icon">✏️</span>
                    </button>
                  </td>
                  <td>
                    <select
                      value={role.status}
                      onChange={(e) => handleStatusChange(role, e.target.value)}
                      className="status-select"
                    >
                      <option value="active">{t('admin.active')}</option>
                      <option value="inactive">{t('admin.inactive')}</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(role)}
                        title={t('common.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(role)}
                        title={t('common.delete')}
                        disabled={['user', 'admin', 'owner', 'anonymous'].includes(role.role)}
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

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{formMode === 'create' ? t('admin.addNewRole') : t('admin.editRole')}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('admin.roleName')} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder={t('admin.roleNamePlaceholder')}
                  />
                </div>
                <div className="form-group">
                  <label>{t('admin.description')}</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('admin.descriptionPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allow_all_action}
                    onChange={(e) => setFormData({ ...formData, allow_all_action: e.target.checked })}
                  />
                  <span>🔓 {t('admin.allowAllPermissions')}</span>
                </label>
              </div>

              {!formData.allow_all_action && (
                <div className="permissions-section">
                  <label>{i18n.language === 'vi' ? 'Phan quyen chi tiet:' : 'Detailed permissions:'}</label>
                  <div className="permissions-grid">
                    {RESOURCES.map(resource => (
                      <div key={resource} className="permission-resource">
                        <div className="resource-header">{RESOURCE_LABELS[resource]}</div>
                        <div className="permission-actions">
                          {ACTIONS.map(action => (
                            <label key={action} className="permission-checkbox">
                              <input
                                type="checkbox"
                                checked={(formData.permissions[resource] || []).includes(action)}
                                onChange={() => toggleFormPermission(resource, action)}
                              />
                              <span>{ACTION_LABELS[action]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowFormModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? t('admin.saving') : (formMode === 'create' ? t('admin.createRole') : t('admin.updateRole'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && permissionsRole && (
        <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>{t('admin.permissions')}: {permissionsRole.display_name || permissionsRole.name}</h2>

            {permissionsRole.allow_all_action ? (
              <div className="all-permissions-notice">
                <span>🔓</span>
                <p>{i18n.language === 'vi'
                  ? 'Role nay co toan quyen (Super Admin). Tat "Toan quyen" trong phan chinh sua de cau hinh chi tiet.'
                  : 'This role has full access (Super Admin). Disable "Full Access" in edit section for detailed configuration.'
                }</p>
              </div>
            ) : (
              <div className="permissions-grid">
                {RESOURCES.map(resource => (
                  <div key={resource} className="permission-resource">
                    <div className="resource-header">{RESOURCE_LABELS[resource]}</div>
                    <div className="permission-actions">
                      {ACTIONS.map(action => (
                        <label key={action} className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={(permissionsData[resource] || []).includes(action)}
                            onChange={() => togglePermission(resource, action)}
                          />
                          <span>{ACTION_LABELS[action]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowPermissionsModal(false)}>
                {t('common.cancel')}
              </button>
              {!permissionsRole.allow_all_action && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSavePermissions}
                  disabled={permissionsLoading}
                >
                  {permissionsLoading ? t('admin.saving') : t('common.save')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showModal && (
        <ConfirmModal
          isOpen={showModal}
          title={t('admin.deleteRole')}
          message={`${t('admin.confirmDeleteRole')} "${selectedRole?.display_name || selectedRole?.name}"?`}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type="danger"
        />
      )}
    </div>
  );
};

export default AdminRoles;
