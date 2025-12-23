import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Create/Edit form
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    role: '',
    allow_all_action: false,
    allow_create: true,
    allow_read: true,
    allow_update: true,
  });
  const [formLoading, setFormLoading] = useState(false);

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
      role: '',
      allow_all_action: false,
      allow_create: true,
      allow_read: true,
      allow_update: true,
    });
    setShowFormModal(true);
  };

  const handleEdit = (role) => {
    setFormMode('edit');
    setSelectedRole(role);
    setFormData({
      role: role.role,
      allow_all_action: role.allow_all_action || false,
      allow_create: role.allow_create !== false,
      allow_read: role.allow_read !== false,
      allow_update: role.allow_update !== false,
    });
    setShowFormModal(true);
  };

  const handleDelete = (role) => {
    setSelectedRole(role);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      alert('Tên role là bắt buộc');
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
      alert('Lỗi: ' + (error.message || 'Unknown error'));
    } finally {
      setFormLoading(false);
    }
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
      alert('Lỗi: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Hoạt động', class: 'approved' },
      inactive: { label: 'Không hoạt động', class: 'pending' },
      deleted: { label: 'Đã xóa', class: 'rejected' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Quản lý Roles</h1>
          <p>Cấu hình vai trò và phân quyền trong hệ thống</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary" onClick={handleCreate}>
            + Thêm Role
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="empty-state">
            <span>🔑</span>
            <p>Không có role nào</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Role</th>
                <th>Quyền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>#{role.id}</td>
                  <td>
                    <strong style={{ textTransform: 'capitalize' }}>{role.role}</strong>
                  </td>
                  <td>
                    <div className="permissions-list">
                      {role.allow_all_action && (
                        <span className="permission-badge all">All</span>
                      )}
                      {role.allow_create && (
                        <span className="permission-badge create">Create</span>
                      )}
                      {role.allow_read && (
                        <span className="permission-badge read">Read</span>
                      )}
                      {role.allow_update && (
                        <span className="permission-badge update">Update</span>
                      )}
                    </div>
                  </td>
                  <td>{getStatusBadge(role.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(role)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(role)}
                        title="Xóa"
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{formMode === 'create' ? 'Thêm Role mới' : 'Chỉnh sửa Role'}</h2>
            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label>Tên Role *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  disabled={formMode === 'edit'}
                  placeholder="vd: moderator, editor..."
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allow_all_action}
                    onChange={(e) => setFormData({ ...formData, allow_all_action: e.target.checked })}
                  />
                  <span>Cho phép tất cả quyền (Admin)</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allow_create}
                    onChange={(e) => setFormData({ ...formData, allow_create: e.target.checked })}
                  />
                  <span>Quyền tạo mới (Create)</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allow_read}
                    onChange={(e) => setFormData({ ...formData, allow_read: e.target.checked })}
                  />
                  <span>Quyền xem (Read)</span>
                </label>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allow_update}
                    onChange={(e) => setFormData({ ...formData, allow_update: e.target.checked })}
                  />
                  <span>Quyền cập nhật (Update)</span>
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowFormModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? 'Đang lưu...' : (formMode === 'create' ? 'Tạo Role' : 'Cập nhật')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showModal && (
        <ConfirmModal
          isOpen={showModal}
          title="Xóa Role"
          message={`Bạn có chắc muốn xóa role "${selectedRole?.role}"?`}
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type="danger"
        />
      )}
    </div>
  );
};

export default AdminRoles;
