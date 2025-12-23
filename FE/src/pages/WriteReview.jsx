import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompanies, useCompany } from '../hooks';
import { useReviewMutationsExtended } from '../hooks/useReviewMutationsExtended';
import StarRating from '../components/StarRating';
import './WriteReview.css';

const WriteReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCompanyId = searchParams.get('company');

  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(preselectedCompanyId || null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    reviews_content: '',
    score: 5,
    // Detailed ratings
    work_environment_rating: 5,
    salary_benefits_rating: 5,
    management_rating: 5,
    work_pressure_rating: 5,
    culture_rating: 5,
    // Job info
    job_title: '',
    custom_job_title: '',
    employment_duration: '',
    employment_status: 'current', // current or former
    // Content
    pros: '',
    cons: '',
    advice: '',
    // Options
    is_anonymous: false,
    would_recommend: true,
  });
  const [error, setError] = useState('');

  const { data: companiesResponse } = useCompanies(1, searchTerm);
  const { data: selectedCompanyResponse } = useCompany(selectedCompanyId);
  const { createReview, isCreating } = useReviewMutationsExtended(selectedCompanyId);

  const companies = companiesResponse?.data || [];
  const selectedCompany = selectedCompanyResponse?.data || selectedCompanyResponse;

  useEffect(() => {
    if (preselectedCompanyId) {
      setSelectedCompanyId(preselectedCompanyId);
    }
  }, [preselectedCompanyId]);

  const commonJobTitles = [
    'Software Engineer',
    'Senior Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'QA Engineer',
    'Product Manager',
    'Project Manager',
    'Business Analyst',
    'Data Analyst',
    'Data Scientist',
    'UI/UX Designer',
    'Marketing Manager',
    'Sales Manager',
    'HR Manager',
    'Accountant',
    'Customer Support',
    'Intern',
    'Other'
  ];

  const employmentDurations = [
    { value: 'less_than_1', label: 'Dưới 1 năm' },
    { value: '1_to_3', label: '1 - 3 năm' },
    { value: 'more_than_3', label: 'Trên 3 năm' },
  ];

  const ratingCriteria = [
    { key: 'work_environment_rating', label: 'Môi trường làm việc', icon: '🏢' },
    { key: 'salary_benefits_rating', label: 'Lương & phúc lợi', icon: '💰' },
    { key: 'management_rating', label: 'Sếp & quản lý', icon: '👔' },
    { key: 'work_pressure_rating', label: 'Áp lực công việc', icon: '⏰' },
    { key: 'culture_rating', label: 'Văn hóa công ty', icon: '🎯' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRatingChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCompanySelect = (company) => {
    setSelectedCompanyId(company.id);
    setSearchTerm(company.name);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedCompanyId(null);
    }
  };

  // Calculate overall score from detailed ratings
  const calculateOverallScore = () => {
    const ratings = [
      formData.work_environment_rating,
      formData.salary_benefits_rating,
      formData.management_rating,
      formData.work_pressure_rating,
      formData.culture_rating,
    ];
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Math.round(avg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCompanyId) {
      setError('Vui lòng chọn công ty bạn muốn đánh giá');
      return;
    }

    if (!formData.title || formData.title.length < 5) {
      setError('Tiêu đề phải có ít nhất 5 ký tự');
      return;
    }

    if (!formData.reviews_content || formData.reviews_content.length < 20) {
      setError('Nội dung đánh giá phải có ít nhất 20 ký tự');
      return;
    }

    try {
      // Combine all content with special delimiters
      let fullContent = formData.reviews_content;
      if (formData.pros) {
        fullContent += `\n\n[PROS]\n${formData.pros}`;
      }
      if (formData.cons) {
        fullContent += `\n\n[CONS]\n${formData.cons}`;
      }
      if (formData.advice) {
        fullContent += `\n\n[ADVICE]\n${formData.advice}`;
      }

      const submitData = {
        title: formData.title,
        reviews_content: fullContent,
        score: calculateOverallScore(),
        job_title: formData.job_title === 'Other' ? formData.custom_job_title : formData.job_title,
        is_anonymous: formData.is_anonymous,
        // Extended fields
        work_environment_rating: formData.work_environment_rating,
        salary_benefits_rating: formData.salary_benefits_rating,
        management_rating: formData.management_rating,
        work_pressure_rating: formData.work_pressure_rating,
        culture_rating: formData.culture_rating,
        employment_duration: formData.employment_duration,
        employment_status: formData.employment_status,
        would_recommend: formData.would_recommend,
      };

      await createReview({ companyId: selectedCompanyId, reviewData: submitData });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || err.error || 'Không thể tạo đánh giá. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      title: '',
      reviews_content: '',
      score: 5,
      work_environment_rating: 5,
      salary_benefits_rating: 5,
      management_rating: 5,
      work_pressure_rating: 5,
      culture_rating: 5,
      job_title: '',
      custom_job_title: '',
      employment_duration: '',
      employment_status: 'current',
      pros: '',
      cons: '',
      advice: '',
      is_anonymous: false,
      would_recommend: true,
    });
    setSelectedCompanyId(null);
    setSearchTerm('');
  };

  if (!isAuthenticated) {
    return (
      <div className="write-review-page">
        <div className="write-review-container">
          <div className="auth-required">
            <div className="auth-icon">🔒</div>
            <h2>Đăng nhập để viết đánh giá</h2>
            <p>Bạn cần đăng nhập để có thể chia sẻ trải nghiệm làm việc của mình.</p>
            <div className="auth-actions">
              <Link to="/login" className="btn-primary">Đăng nhập</Link>
              <Link to="/register" className="btn-secondary">Đăng ký</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="write-review-page">
        <div className="write-review-container">
          <div className="success-state">
            <div className="success-icon">✅</div>
            <h2>Cảm ơn bạn đã đánh giá!</h2>
            <p>Đánh giá của bạn đã được gửi thành công và sẽ được hiển thị sau khi được xét duyệt.</p>
            <div className="success-actions">
              <button onClick={() => navigate(`/companies/${selectedCompanyId}`)} className="btn-primary">
                Xem công ty
              </button>
              <button onClick={resetForm} className="btn-secondary">
                Viết đánh giá khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="write-review-page">
      <div className="write-review-container">
        <div className="page-header">
          <h1>Viết đánh giá</h1>
          <p>Chia sẻ trải nghiệm làm việc của bạn để giúp đỡ cộng đồng</p>
        </div>

        <div className="guidelines-reminder">
          <div className="reminder-icon">💡</div>
          <div className="reminder-content">
            <strong>Lưu ý khi viết đánh giá</strong>
            <p>Đánh giá trung thực, cụ thể và cân bằng sẽ hữu ích nhất cho cộng đồng.
              <Link to="/guidelines"> Xem hướng dẫn đầy đủ →</Link>
            </p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="review-form">
          {/* Company Selection */}
          <div className="form-section">
            <h3>📍 Chọn công ty</h3>
            <div className="form-group company-search">
              <label>Công ty bạn muốn đánh giá *</label>
              <div className="search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Tìm kiếm công ty..."
                  className="search-input"
                />
                {showDropdown && searchTerm && companies.length > 0 && (
                  <div className="company-dropdown">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="dropdown-item"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div className="company-name">{company.name}</div>
                        <div className="company-info-small">
                          ⭐ {company.avg_score?.toFixed(1) || '0.0'} • {company.total_reviews || 0} đánh giá
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCompany && (
                <div className="selected-company">
                  <span className="selected-label">Đã chọn:</span>
                  <span className="selected-name">{selectedCompany.name}</span>
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => {
                      setSelectedCompanyId(null);
                      setSearchTerm('');
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Employment Info */}
          <div className="form-section">
            <h3>💼 Thông tin công việc</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Chức danh của bạn</label>
                <select
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Chọn chức danh --</option>
                  {commonJobTitles.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
                {formData.job_title === 'Other' && (
                  <input
                    type="text"
                    name="custom_job_title"
                    value={formData.custom_job_title}
                    onChange={handleChange}
                    placeholder="Nhập chức danh của bạn..."
                    className="form-input mt-2"
                  />
                )}
              </div>
              <div className="form-group">
                <label>Thời gian làm việc</label>
                <select
                  name="employment_duration"
                  value={formData.employment_duration}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- Chọn thời gian --</option>
                  {employmentDurations.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Trạng thái làm việc</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="employment_status"
                    value="current"
                    checked={formData.employment_status === 'current'}
                    onChange={handleChange}
                  />
                  <span>Đang làm việc</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="employment_status"
                    value="former"
                    checked={formData.employment_status === 'former'}
                    onChange={handleChange}
                  />
                  <span>Đã nghỉ việc</span>
                </label>
              </div>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="form-section">
            <h3>⭐ Đánh giá chi tiết</h3>
            <p className="section-description">Đánh giá từng khía cạnh của công ty (1-10 điểm)</p>

            <div className="detailed-ratings">
              {ratingCriteria.map((criteria) => (
                <div key={criteria.key} className="rating-row">
                  <div className="rating-label-group">
                    <span className="rating-icon">{criteria.icon}</span>
                    <span className="rating-name">{criteria.label}</span>
                  </div>
                  <div className="rating-stars-container">
                    <StarRating
                      value={formData[criteria.key]}
                      onChange={(value) => handleRatingChange(criteria.key, value)}
                      size="small"
                    />
                    <span className="rating-value">{formData[criteria.key]}/10</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="overall-score-preview">
              <span>Điểm tổng hợp:</span>
              <span className="overall-value">{calculateOverallScore()}/10</span>
            </div>
          </div>

          {/* Review Content */}
          <div className="form-section">
            <h3>📝 Nội dung đánh giá</h3>

            <div className="form-group">
              <label>Tiêu đề đánh giá *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Môi trường làm việc tốt, nhiều cơ hội phát triển"
                maxLength={100}
                className="form-input"
              />
              <span className="char-count">{formData.title.length}/100</span>
            </div>

            <div className="form-group">
              <label>Trải nghiệm tổng quan *</label>
              <textarea
                name="reviews_content"
                value={formData.reviews_content}
                onChange={handleChange}
                rows={4}
                placeholder="Chia sẻ trải nghiệm chung của bạn khi làm việc tại công ty..."
                className="form-textarea"
              />
              <span className="char-count">{formData.reviews_content.length} ký tự (tối thiểu 20)</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>✅ Ưu điểm</label>
                <textarea
                  name="pros"
                  value={formData.pros}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Những điểm tích cực của công ty..."
                  className="form-textarea pros-textarea"
                />
              </div>
              <div className="form-group">
                <label>❌ Nhược điểm</label>
                <textarea
                  name="cons"
                  value={formData.cons}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Những điểm cần cải thiện..."
                  className="form-textarea cons-textarea"
                />
              </div>
            </div>

            <div className="form-group">
              <label>💡 Lời khuyên cho ban lãnh đạo</label>
              <textarea
                name="advice"
                value={formData.advice}
                onChange={handleChange}
                rows={2}
                placeholder="Bạn có đề xuất gì cho công ty? (tùy chọn)"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Recommendation & Privacy */}
          <div className="form-section">
            <h3>🎯 Khuyến nghị & Tùy chọn</h3>

            <div className="form-group">
              <label className="checkbox-label recommend-checkbox">
                <input
                  type="checkbox"
                  name="would_recommend"
                  checked={formData.would_recommend}
                  onChange={handleChange}
                />
                <span className="checkbox-icon">👍</span>
                <span>Tôi khuyên bạn bè/người thân làm việc tại công ty này</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleChange}
                />
                <span className="checkbox-icon">🔒</span>
                <span>Đánh giá ẩn danh</span>
              </label>
              <p className="form-hint">
                Nếu chọn, tên của bạn sẽ không được hiển thị công khai.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" disabled={isCreating || !selectedCompanyId} className="btn-primary">
              {isCreating ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
