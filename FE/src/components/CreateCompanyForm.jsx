import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { companyService } from '../services/companyService';
import './CreateCompanyForm.css';

const CreateCompanyForm = ({ searchQuery, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: searchQuery || '',
    owner: '',
    phone: '',
    main_office: '',
    website: '',
    industry: '',
    employee_count_min: '',
    employee_count_max: '',
    is_hiring: false,
    logo: '',
    description: '',
    founded_year: '',
    tech_stack: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || formData.name.trim().length < 2) {
      setError(t('components.companyNameMin'));
      return;
    }

    if (!isAuthenticated) {
      setError(t('components.pleaseLoginToCreate'));
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        employee_count_min: formData.employee_count_min ? parseInt(formData.employee_count_min) : null,
        employee_count_max: formData.employee_count_max ? parseInt(formData.employee_count_max) : null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
      };
      const response = await companyService.createCompany(submitData);

      if (response.status === 'ok' || response.status === 'success') {
        const company = response.data;
        if (onSuccess) {
          onSuccess(company);
        } else {
          navigate(`/companies/${company.id}`);
        }
      } else {
        setError(response.message || t('components.cannotCreateCompany'));
      }
    } catch (err) {
      setError(err.message || err.error || t('components.cannotCreateCompany'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="create-company-form">
        <div className="info-message">
          <p>{t('components.pleaseLoginToCreate')}. <Link to="/login">{t('nav.login')}</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-company-form">
      <h3>{t('components.createCompany')}</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('components.companyName')} *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            placeholder={t('components.companyNamePlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('components.companyOwner')} *</label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            required
            placeholder={t('components.ownerPlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('auth.phone')}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+84123456789"
          />
        </div>
        <div className="form-group">
          <label>{t('components.mainOffice')}</label>
          <input
            type="text"
            name="main_office"
            value={formData.main_office}
            onChange={handleChange}
            placeholder={t('components.officePlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('company.website')}</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>
        <div className="form-group">
          <label>{t('components.logoUrl')}</label>
          <input
            type="url"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="form-group">
          <label>{t('components.foundedYear')}</label>
          <input
            type="number"
            name="founded_year"
            value={formData.founded_year}
            onChange={handleChange}
            placeholder={t('components.foundedYearExample')}
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="form-group">
          <label>{t('components.companyDescription')}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('components.descriptionPlaceholder')}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label>{t('components.techStack')}</label>
          <input
            type="text"
            name="tech_stack"
            value={formData.tech_stack}
            onChange={handleChange}
            placeholder={t('components.techStackPlaceholder')}
          />
        </div>
        <div className="form-group">
          <label>{t('company.industry')}</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">{t('components.selectIndustry')}</option>
            <option value="CNTT - Phần mềm">CNTT - Phần mềm</option>
            <option value="Giáo dục">Giáo dục</option>
            <option value="Bán hàng/ Kinh doanh">Bán hàng/ Kinh doanh</option>
            <option value="Bảo hiểm">Bảo hiểm</option>
            <option value="Ngân hàng">Ngân hàng</option>
            <option value="Sản xuất / Vận hành sản xuất">Sản xuất / Vận hành sản xuất</option>
            <option value="Dịch vụ khách hàng">Dịch vụ khách hàng</option>
            <option value="Kỹ thuật">Kỹ thuật</option>
            <option value="Y tế / Chăm sóc sức khỏe">Y tế / Chăm sóc sức khỏe</option>
            <option value="Giải trí">Giải trí</option>
            <option value="Quản lý chất lượng (QA/QC)">Quản lý chất lượng (QA/QC)</option>
            <option value="Điện / Điện tử / Điện lạnh">Điện / Điện tử / Điện lạnh</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t('components.employeeScale')}</label>
          <div className="employee-count-group">
            <input
              type="number"
              name="employee_count_min"
              value={formData.employee_count_min}
              onChange={handleChange}
              placeholder={t('components.from')}
              min="0"
              className="employee-count-input"
            />
            <span className="employee-count-separator">-</span>
            <input
              type="number"
              name="employee_count_max"
              value={formData.employee_count_max}
              onChange={handleChange}
              placeholder={t('components.to')}
              min="0"
              className="employee-count-input"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_hiring"
              checked={formData.is_hiring}
              onChange={(e) => setFormData({ ...formData, is_hiring: e.target.checked })}
            />
            <span>{t('components.isHiring')}</span>
          </label>
        </div>
        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              {t('common.cancel')}
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('components.creating') : t('components.createCompany')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyForm;
