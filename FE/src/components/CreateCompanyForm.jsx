import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { companyService } from '../services/companyService';
import './CreateCompanyForm.css';

const CreateCompanyForm = ({ searchQuery, onSuccess, onCancel }) => {
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
      setError('Tên công ty phải có ít nhất 2 ký tự');
      return;
    }

    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để tạo công ty');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        employee_count_min: formData.employee_count_min ? parseInt(formData.employee_count_min) : null,
        employee_count_max: formData.employee_count_max ? parseInt(formData.employee_count_max) : null,
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
        setError(response.message || 'Không thể tạo công ty');
      }
    } catch (err) {
      setError(err.message || err.error || 'Không thể tạo công ty');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="create-company-form">
        <div className="info-message">
          <p>Vui lòng <a href="/login">đăng nhập</a> để tạo công ty mới.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-company-form">
      <h3>Tạo công ty mới</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên công ty *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            placeholder="Tên công ty..."
          />
        </div>
        <div className="form-group">
          <label>Chủ sở hữu *</label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            required
            placeholder="Tên chủ sở hữu..."
          />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+84123456789"
          />
        </div>
        <div className="form-group">
          <label>Văn phòng chính</label>
          <input
            type="text"
            name="main_office"
            value={formData.main_office}
            onChange={handleChange}
            placeholder="Địa chỉ văn phòng..."
          />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>
        <div className="form-group">
          <label>Ngành nghề</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">-- Chọn ngành nghề --</option>
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
          <label>Quy mô nhân viên</label>
          <div className="employee-count-group">
            <input
              type="number"
              name="employee_count_min"
              value={formData.employee_count_min}
              onChange={handleChange}
              placeholder="Từ"
              min="0"
              className="employee-count-input"
            />
            <span className="employee-count-separator">-</span>
            <input
              type="number"
              name="employee_count_max"
              value={formData.employee_count_max}
              onChange={handleChange}
              placeholder="Đến"
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
            <span>Đang tuyển dụng</span>
          </label>
        </div>
        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Hủy
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Đang tạo...' : 'Tạo công ty'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompanyForm;

