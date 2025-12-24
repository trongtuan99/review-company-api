import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { configService } from '../../services/configService';
import './Admin.css';

const CATEGORY_ICONS = {
  general: '⚙️',
  contact: '📞',
  features: '🚀',
  appearance: '🎨',
};

const CATEGORY_LABELS = {
  vi: {
    general: 'Cai dat chung',
    contact: 'Thong tin lien he',
    features: 'Tinh nang',
    appearance: 'Giao dien',
  },
  en: {
    general: 'General Settings',
    contact: 'Contact Info',
    features: 'Features',
    appearance: 'Appearance',
  },
};

const AdminConfigs = () => {
  const { t, i18n } = useTranslation();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [editedConfigs, setEditedConfigs] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = ['general', 'contact', 'features', 'appearance'];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await configService.getAllConfigs();
      if (response.status === 'ok' || response.status === 'success') {
        setConfigs(response.data || []);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
      setErrorMessage(t('admin.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category) => {
    const lang = i18n.language === 'vi' ? 'vi' : 'en';
    return CATEGORY_LABELS[lang][category] || category;
  };

  const getConfigsByCategory = (category) => {
    return configs
      .filter((c) => c.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const handleConfigChange = (key, value) => {
    setEditedConfigs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getConfigValue = (config) => {
    if (editedConfigs[config.key] !== undefined) {
      return editedConfigs[config.key];
    }
    return config.value;
  };

  const hasChanges = () => {
    return Object.keys(editedConfigs).length > 0;
  };

  const handleSave = async () => {
    if (!hasChanges()) return;

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const updates = Object.entries(editedConfigs).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const response = await configService.bulkUpdateConfigs(updates);

      if (response.status === 'ok' || response.status === 'success') {
        setSuccessMessage(i18n.language === 'vi' ? 'Luu thanh cong!' : 'Saved successfully!');
        setEditedConfigs({});
        await loadConfigs();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || t('admin.errorOccurred'));
      }
    } catch (error) {
      console.error('Error saving configs:', error);
      setErrorMessage(error.message || t('admin.errorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedConfigs({});
  };

  const renderConfigInput = (config) => {
    const value = getConfigValue(config);

    switch (config.value_type) {
      case 'boolean':
        return (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value === 'true' || value === true}
              onChange={(e) => handleConfigChange(config.key, e.target.checked ? 'true' : 'false')}
            />
            <span className="toggle-slider"></span>
          </label>
        );

      case 'integer':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(config.key, e.target.value)}
            className="config-input"
          />
        );

      default:
        if (config.key.includes('url') || config.key.includes('website')) {
          return (
            <input
              type="url"
              value={value || ''}
              onChange={(e) => handleConfigChange(config.key, e.target.value)}
              className="config-input"
              placeholder="https://"
            />
          );
        }
        if (config.key.includes('email')) {
          return (
            <input
              type="email"
              value={value || ''}
              onChange={(e) => handleConfigChange(config.key, e.target.value)}
              className="config-input"
            />
          );
        }
        if (config.key.includes('address') || config.key.includes('description') || config.key.includes('tagline')) {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => handleConfigChange(config.key, e.target.value)}
              className="config-textarea"
              rows={2}
            />
          );
        }
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleConfigChange(config.key, e.target.value)}
            className="config-input"
          />
        );
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return (
    <div className="admin-configs">
      <div className="admin-header">
        <h2>
          ⚙️ {i18n.language === 'vi' ? 'Cai dat he thong' : 'System Settings'}
        </h2>
        <p className="admin-subtitle">
          {i18n.language === 'vi'
            ? 'Quan ly cac cau hinh website'
            : 'Manage website configurations'}
        </p>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      <div className="config-layout">
        {/* Category tabs */}
        <div className="config-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`config-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="tab-icon">{CATEGORY_ICONS[category]}</span>
              <span className="tab-label">{getCategoryLabel(category)}</span>
              <span className="tab-count">{getConfigsByCategory(category).length}</span>
            </button>
          ))}
        </div>

        {/* Config list */}
        <div className="config-content">
          <div className="config-section">
            <h3>
              {CATEGORY_ICONS[activeCategory]} {getCategoryLabel(activeCategory)}
            </h3>

            <div className="config-list">
              {getConfigsByCategory(activeCategory).map((config) => (
                <div
                  key={config.key}
                  className={`config-item ${editedConfigs[config.key] !== undefined ? 'modified' : ''}`}
                >
                  <div className="config-info">
                    <div className="config-label">{config.label}</div>
                    {config.description && (
                      <div className="config-description">{config.description}</div>
                    )}
                    <div className="config-key">
                      <code>{config.key}</code>
                      {config.is_public && (
                        <span className="public-badge">
                          {i18n.language === 'vi' ? 'Cong khai' : 'Public'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="config-control">{renderConfigInput(config)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Save bar */}
          {hasChanges() && (
            <div className="config-save-bar">
              <span className="changes-count">
                {Object.keys(editedConfigs).length}{' '}
                {i18n.language === 'vi' ? 'thay doi chua luu' : 'unsaved changes'}
              </span>
              <div className="save-actions">
                <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
                  {t('common.cancel')}
                </button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving
                    ? i18n.language === 'vi'
                      ? 'Dang luu...'
                      : 'Saving...'
                    : t('common.save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConfigs;
