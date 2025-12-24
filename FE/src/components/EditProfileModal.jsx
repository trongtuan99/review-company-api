import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import './EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const { t } = useTranslation();
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
        setError(response.message || t('components.cannotUpdateProfile'));
      }
    } catch (err) {
      setError(err.message || t('components.cannotUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('components.editProfile')}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t('components.firstName')}</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder={t('components.firstNamePlaceholder')}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('components.lastName')}</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder={t('components.lastNamePlaceholder')}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled"
            />
            <small>{t('components.emailCannotChange')}</small>
          </div>

          <div className="form-group">
            <label>{t('components.gender')}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">{t('components.selectGender')}</option>
              <option value="male">{t('components.male')}</option>
              <option value="female">{t('components.female')}</option>
              <option value="other">{t('components.other')}</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? t('components.saving') : t('components.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
