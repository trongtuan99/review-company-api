import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Create user form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Update role form
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [filter.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(filter.page, 10);
      setUsers(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        pages: response.pagination?.total_pages || 1,
      });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await adminService.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    if (action === 'update-role') {
      setSelectedRoleId(user.role?.id || '');
      setShowRoleModal(true);
    } else {
      setShowModal(true);
    }
  };

  const confirmAction = async () => {
    if (!selectedUser || !modalAction) return;

    try {
      if (modalAction === 'delete') {
        await adminService.deleteUser(selectedUser.id);
      }
      await loadUsers();
      setShowModal(false);
      setSelectedUser(null);
      setModalAction(null);
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Có lỗi xảy ra: ' + (error.message || 'Unknown error'));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password) {
      alert('Email và Password là bắt buộc');
      return;
    }

    try {
      setCreateLoading(true);
      const userData = {
        email: createForm.email,
        password: createForm.password,
      };
      if (createForm.first_name) userData.first_name = createForm.first_name;
      if (createForm.last_name) userData.last_name = createForm.last_name;

      const response = await adminService.createUser(userData, createForm.role_id);

      if (response && response.data) {
        setShowCreateModal(false);
        setCreateForm({ email: '', password: '', first_name: '', last_name: '', role_id: '' });
        await loadUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Lỗi tạo user: ' + (error.message || 'Unknown error'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRoleId) {
      alert('Vui lòng chọn role');
      return;
    }

    try {
      await adminService.updateUserRole(selectedUser.id, selectedRoleId);
      setShowRoleModal(false);
      setSelectedUser(null);
      setSelectedRoleId('');
      await loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Lỗi cập nhật role: ' + (error.message || 'Unknown error'));
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { label: 'Admin', class: 'admin' },
      owner: { label: 'Owner', class: 'hr' },
      user: { label: 'User', class: 'user' },
    };
    const roleName = role?.role || role;
    const roleInfo = roleMap[roleName] || { label: roleName || 'User', class: 'default' };
    return <span className={`role-badge ${roleInfo.class}`}>{roleInfo.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Quản lý Users</h1>
          <p>Quản lý người dùng và phân quyền</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Thêm User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group search-group">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tìm theo email, tên..."
            value={filter.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>
        <button className="btn-refresh" onClick={loadUsers}>
          🔄 Làm mới
        </button>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span>👥</span>
            <p>Không có users nào</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.first_name?.[0] || user.email?.[0] || '?'}
                      </div>
                      <span>{user.first_name} {user.last_name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleAction(user, 'update-role')}
                        title="Đổi vai trò"
                      >
                        🔑
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleAction(user, 'delete')}
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="admin-pagination">
          <button
            disabled={filter.page === 1}
            onClick={() => handleFilterChange('page', filter.page - 1)}
          >
            ← Trước
          </button>
          <span>Trang {filter.page} / {pagination.pages}</span>
          <button
            disabled={filter.page === pagination.pages}
            onClick={() => handleFilterChange('page', filter.page + 1)}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thêm User mới</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Họ</label>
                <input
                  type="text"
                  value={createForm.first_name}
                  onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tên</label>
                <input
                  type="text"
                  value={createForm.last_name}
                  onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  value={createForm.role_id}
                  onChange={(e) => setCreateForm({ ...createForm, role_id: e.target.value })}
                  className="filter-select"
                >
                  <option value="">-- Mặc định (User) --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={createLoading}>
                  {createLoading ? 'Đang tạo...' : 'Tạo User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Cập nhật vai trò</h2>
            <p>User: {selectedUser?.email}</p>
            <div className="form-group">
              <label>Vai trò</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="filter-select"
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRoleModal(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleUpdateRole}>
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showModal && (
        <ConfirmModal
          isOpen={showModal}
          title={modalAction === 'delete' ? 'Xóa User' : 'Chi tiết User'}
          message={`Bạn có chắc muốn xóa user ${selectedUser?.email}?`}
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          type="danger"
        />
      )}
    </div>
  );
};

export default AdminUsers;
