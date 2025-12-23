import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync form data when user prop changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        gender: user.gender || ''
      });
      setError('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userService.updateProfile(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        gender: formData.gender
      });

      if (response.status === 'ok' || response.status === 'success') {
        onUpdate && onUpdate(response.data);
        onClose();
      } else {
        setError(response.message || 'Không thể cập nhật thông tin');
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chỉnh sửa hồ sơ</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên đệm</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Nhập họ và tên đệm"
                required
              />
            </div>
            <div className="form-group">
              <label>Tên</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Nhập tên"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled"
            />
            <small>Email không thể thay đổi</small>
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
