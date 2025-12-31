import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCompanies, useCompany } from '../hooks';
import { useReviewMutationsExtended } from '../hooks/useReviewMutationsExtended';
import StarRating from '../components/StarRating';
import './WriteReview.css';

const WriteReview = () => {
  const { t } = useTranslation();
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
    // Detailed ratings (keys match backend model now)
    salary_satisfaction: 5,
    work_life_balance: 5,
    career_growth: 5,
    management_rating: 5,
    culture_rating: 5,
    // Job info
    job_title: '',
    custom_job_title: '',
    years_employed: '', // Changed from employment_duration
    employment_status: 'current', // current or former
    // Content
    pros: '',
    cons: '',
    advice: '',
    // Options
    is_anonymous: false,
    vote_for_work: true, // Changed from would_recommend
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
    { value: 'less_than_1', label: t('review.lessThan1Year') },
    { value: '1_to_3', label: t('review.oneToThreeYears') },
    { value: 'more_than_3', label: t('review.moreThan3Years') },
  ];

  const ratingCriteria = [
    { key: 'work_environment_rating', label: t('review.workEnvironment'), icon: '🏢' },
    { key: 'salary_benefits_rating', label: t('review.salaryBenefits'), icon: '💰' },
    { key: 'management_rating', label: t('review.management'), icon: '👔' },
    { key: 'work_pressure_rating', label: t('review.workPressure'), icon: '⏰' },
    { key: 'culture_rating', label: t('review.culture'), icon: '🎯' },
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
      setError(t('validation.selectCompany'));
      return;
    }

    if (!formData.title || formData.title.length < 5) {
      setError(t('validation.titleMinLength'));
      return;
    }

    if (!formData.reviews_content || formData.reviews_content.length < 20) {
      setError(t('validation.contentMinLength'));
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
      setError(err.message || err.error || t('validation.createReviewError'));
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
            <h2>{t('auth.loginRequired')}</h2>
            <p>{t('auth.loginRequiredDesc')}</p>
            <div className="auth-actions">
              <Link to="/login" className="btn-primary">{t('auth.login')}</Link>
              <Link to="/register" className="btn-secondary">{t('auth.register')}</Link>
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
            <h2>{t('review.thankYouReview')}</h2>
            <p>{t('review.reviewSubmitted')}</p>
            <div className="success-actions">
              <button onClick={() => navigate(`/companies/${selectedCompanyId}`)} className="btn-primary">
                {t('review.viewCompany')}
              </button>
              <button onClick={resetForm} className="btn-secondary">
                {t('review.writeAnotherReview')}
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
          <h1>{t('review.writeReview')}</h1>
          <p>{t('review.shareExperience')}</p>
        </div>

        <div className="guidelines-reminder">
          <div className="reminder-icon">💡</div>
          <div className="reminder-content">
            <strong>{t('review.guidelinesReminder')}</strong>
            <p>{t('review.guidelinesDesc')}
              <Link to="/guidelines"> {t('review.viewFullGuidelines')} →</Link>
            </p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="review-form">
          {/* Company Selection */}
          <div className="form-section">
            <h3>📍 {t('review.selectCompany')}</h3>
            <div className="form-group company-search">
              <label>{t('review.companyToReview')} *</label>
              <div className="search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={t('review.searchCompany')}
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
                  <span className="selected-label">{t('common.selected')}:</span>
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
            <h3>💼 {t('review.jobInfo')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t('review.yourJobTitle')}</label>
                <select
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- {t('review.selectJobTitle')} --</option>
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
                    placeholder={t('review.enterJobTitle')}
                    className="form-input mt-2"
                  />
                )}
              </div>
              <div className="form-group">
                <label>{t('review.workDuration')}</label>
                <select
                  name="employment_duration"
                  value={formData.employment_duration}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">-- {t('review.selectDuration')} --</option>
                  {employmentDurations.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t('review.workStatus')}</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="employment_status"
                    value="current"
                    checked={formData.employment_status === 'current'}
                    onChange={handleChange}
                  />
                  <span>{t('review.currentEmployee')}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="employment_status"
                    value="former"
                    checked={formData.employment_status === 'former'}
                    onChange={handleChange}
                  />
                  <span>{t('review.formerEmployee')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="form-section">
            <h3>⭐ {t('review.detailedRating')}</h3>
            <p className="section-description">{t('review.ratingDesc')}</p>

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
              <span>{t('review.overallScore')}:</span>
              <span className="overall-value">{calculateOverallScore()}/10</span>
            </div>
          </div>

          {/* Review Content */}
          <div className="form-section">
            <h3>📝 {t('review.reviewContent')}</h3>

            <div className="form-group">
              <label>{t('review.reviewTitle')} *</label>
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
              <label>{t('review.overallExperienceLabel')} *</label>
              <textarea
                name="reviews_content"
                value={formData.reviews_content}
                onChange={handleChange}
                rows={4}
                placeholder={t('review.overallExperiencePlaceholder')}
                className="form-textarea"
              />
              <span className="char-count">{formData.reviews_content.length} {t('validation.minChars')}</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>✅ {t('review.pros')}</label>
                <textarea
                  name="pros"
                  value={formData.pros}
                  onChange={handleChange}
                  rows={3}
                  placeholder={t('review.prosPlaceholder')}
                  className="form-textarea pros-textarea"
                />
              </div>
              <div className="form-group">
                <label>❌ {t('review.cons')}</label>
                <textarea
                  name="cons"
                  value={formData.cons}
                  onChange={handleChange}
                  rows={3}
                  placeholder={t('review.consPlaceholder')}
                  className="form-textarea cons-textarea"
                />
              </div>
            </div>

            <div className="form-group">
              <label>💡 {t('review.advice')}</label>
              <textarea
                name="advice"
                value={formData.advice}
                onChange={handleChange}
                rows={2}
                placeholder={t('review.advicePlaceholder')}
                className="form-textarea"
              />
            </div>
          </div>

          {/* Recommendation & Privacy */}
          <div className="form-section">
            <h3>🎯 {t('review.recommendOptions')}</h3>

            <div className="form-group">
              <label className="checkbox-label recommend-checkbox">
                <input
                  type="checkbox"
                  name="would_recommend"
                  checked={formData.would_recommend}
                  onChange={handleChange}
                />
                <span className="checkbox-icon">👍</span>
                <span>{t('review.recommendFriends')}</span>
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
                <span>{t('review.anonymousReview')}</span>
              </label>
              <p className="form-hint">
                {t('review.anonymousHint')}
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isCreating || !selectedCompanyId} className="btn-primary">
              {isCreating ? t('common.sending') : t('review.submitReview')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
