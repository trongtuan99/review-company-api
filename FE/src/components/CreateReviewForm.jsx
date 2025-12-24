import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReviewMutationsExtended } from '../hooks/useReviewMutationsExtended';
import StarRating from './StarRating';
import './CreateReviewForm.css';

const CreateReviewForm = ({ companyId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    reviews_content: '',
    score: 5,
    job_title: '',
    custom_job_title: '',
    is_anonymous: false,
    pros: '',
    cons: '',
    advice: '',
    // Detailed ratings (1-5)
    salary_satisfaction: 0,
    work_life_balance: 0,
    career_growth: 0,
    management_rating: 0,
    culture_rating: 0,
    // Employment info
    employment_status: 'current_employee',
    years_employed: '',
  });
  const [error, setError] = useState('');
  const { createReview, isCreating } = useReviewMutationsExtended(companyId);

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

  const getRatingLabel = (score) => {
    if (score <= 3) return t('rating.unsatisfied');
    if (score <= 5) return t('rating.acceptable');
    if (score <= 7) return t('rating.satisfied');
    if (score <= 9) return t('rating.verySatisfied');
    return t('rating.excellent');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || formData.title.length < 5) {
      setError(t('components.titleMinChars'));
      return;
    }

    if (!formData.reviews_content || formData.reviews_content.length < 20) {
      setError(t('components.contentMinChars'));
      return;
    }

    try {
      // Combine advice into reviews_content if provided
      let fullContent = formData.reviews_content;
      if (formData.advice) {
        fullContent += `\n\n[ADVICE]\n${formData.advice}`;
      }

      const submitData = {
        title: formData.title,
        reviews_content: fullContent,
        score: formData.score,
        job_title: formData.job_title === 'Other' ? formData.custom_job_title : formData.job_title,
        is_anonymous: formData.is_anonymous,
        pros: formData.pros,
        cons: formData.cons,
        salary_satisfaction: formData.salary_satisfaction || null,
        work_life_balance: formData.work_life_balance || null,
        career_growth: formData.career_growth || null,
        management_rating: formData.management_rating || null,
        culture_rating: formData.culture_rating || null,
        employment_status: formData.employment_status,
        years_employed: formData.years_employed ? parseFloat(formData.years_employed) : null,
      };

      await createReview({ companyId, reviewData: submitData });
      onSuccess?.();
      setFormData({
        title: '',
        reviews_content: '',
        score: 5,
        job_title: '',
        custom_job_title: '',
        is_anonymous: false,
        pros: '',
        cons: '',
        advice: '',
        salary_satisfaction: 0,
        work_life_balance: 0,
        career_growth: 0,
        management_rating: 0,
        culture_rating: 0,
        employment_status: 'current_employee',
        years_employed: '',
      });
    } catch (err) {
      setError(err.message || err.error || t('review.cannotCreateReview'));
    }
  };

  return (
    <div className="create-review-form">
      <div className="form-header">
        <h3>{t('components.writeReview')}</h3>
        <Link to="/guidelines" className="guidelines-link">
          📋 {t('components.viewGuidelines')}
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div className="form-section">
          <div className="section-title">{t('components.overallRating')}</div>
          <div className="form-group">
            <label>{t('components.ratingScore')} *</label>
            <div className="rating-container">
              <StarRating
                value={formData.score}
                onChange={(score) => setFormData(prev => ({ ...prev, score }))}
              />
              <span className="rating-label">{getRatingLabel(formData.score)}</span>
            </div>
          </div>
        </div>

        {/* Detailed Ratings Section */}
        <div className="form-section">
          <div className="section-title">{t('components.detailedRatings')}</div>
          <p className="section-hint">{t('components.detailedRatingsHint')}</p>
          <div className="detailed-ratings-grid">
            <div className="rating-item">
              <label>💰 {t('components.salaryBenefits')}</label>
              <div className="mini-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`mini-star ${formData.salary_satisfaction >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, salary_satisfaction: star }))}
                  >
                    ★
                  </button>
                ))}
                {formData.salary_satisfaction > 0 && (
                  <button type="button" className="clear-rating" onClick={() => setFormData(prev => ({ ...prev, salary_satisfaction: 0 }))}>✕</button>
                )}
              </div>
            </div>
            <div className="rating-item">
              <label>⚖️ {t('components.workLifeBalance')}</label>
              <div className="mini-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`mini-star ${formData.work_life_balance >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, work_life_balance: star }))}
                  >
                    ★
                  </button>
                ))}
                {formData.work_life_balance > 0 && (
                  <button type="button" className="clear-rating" onClick={() => setFormData(prev => ({ ...prev, work_life_balance: 0 }))}>✕</button>
                )}
              </div>
            </div>
            <div className="rating-item">
              <label>📈 {t('components.careerGrowth')}</label>
              <div className="mini-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`mini-star ${formData.career_growth >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, career_growth: star }))}
                  >
                    ★
                  </button>
                ))}
                {formData.career_growth > 0 && (
                  <button type="button" className="clear-rating" onClick={() => setFormData(prev => ({ ...prev, career_growth: 0 }))}>✕</button>
                )}
              </div>
            </div>
            <div className="rating-item">
              <label>👔 {t('components.managementRating')}</label>
              <div className="mini-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`mini-star ${formData.management_rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, management_rating: star }))}
                  >
                    ★
                  </button>
                ))}
                {formData.management_rating > 0 && (
                  <button type="button" className="clear-rating" onClick={() => setFormData(prev => ({ ...prev, management_rating: 0 }))}>✕</button>
                )}
              </div>
            </div>
            <div className="rating-item">
              <label>🏢 {t('components.companyCulture')}</label>
              <div className="mini-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`mini-star ${formData.culture_rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, culture_rating: star }))}
                  >
                    ★
                  </button>
                ))}
                {formData.culture_rating > 0 && (
                  <button type="button" className="clear-rating" onClick={() => setFormData(prev => ({ ...prev, culture_rating: 0 }))}>✕</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Info Section */}
        <div className="form-section">
          <div className="section-title">{t('components.jobInfo')}</div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('components.employmentStatus')}</label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="current_employee">{t('components.currentlyWorking')}</option>
                <option value="former_employee">{t('components.formerEmployee')}</option>
                <option value="not_specified">{t('components.notSpecified')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('components.yearsWorked')}</label>
              <input
                type="number"
                name="years_employed"
                value={formData.years_employed}
                onChange={handleChange}
                placeholder={t('components.yearExample')}
                min="0"
                step="0.5"
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('components.yourJobTitle')}</label>
            <select
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">{t('components.selectJobTitle')}</option>
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
                placeholder={t('components.enterJobTitle')}
                className="form-input mt-2"
              />
            )}
          </div>
        </div>

        {/* Review Content Section */}
        <div className="form-section">
          <div className="section-title">{t('components.reviewContent')}</div>

          <div className="form-group">
            <label>{t('components.reviewTitle')} *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={100}
              placeholder={t('components.reviewTitlePlaceholder')}
              className="form-input"
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label>{t('components.overallExperience')} *</label>
            <textarea
              name="reviews_content"
              value={formData.reviews_content}
              onChange={handleChange}
              rows={4}
              placeholder={t('components.overallExperiencePlaceholder')}
              className="form-textarea"
            />
            <span className="char-count">{formData.reviews_content.length} {t('components.charCount')} ({t('components.minChars')} 20)</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>👍 {t('review.pros')}</label>
              <textarea
                name="pros"
                value={formData.pros}
                onChange={handleChange}
                rows={3}
                placeholder={t('components.prosPlaceholder')}
                className="form-textarea"
              />
            </div>
            <div className="form-group">
              <label>👎 {t('review.cons')}</label>
              <textarea
                name="cons"
                value={formData.cons}
                onChange={handleChange}
                rows={3}
                placeholder={t('components.consPlaceholder')}
                className="form-textarea"
              />
            </div>
          </div>

          <div className="form-group">
            <label>💡 {t('components.adviceForManagement')}</label>
            <textarea
              name="advice"
              value={formData.advice}
              onChange={handleChange}
              rows={2}
              placeholder={t('components.advicePlaceholder')}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="form-section">
          <div className="section-title">{t('components.displayOptions')}</div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_anonymous"
                checked={formData.is_anonymous}
                onChange={handleChange}
              />
              <span>{t('components.anonymousReview')}</span>
            </label>
            <p className="form-hint">
              {t('components.anonymousHint')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            {t('common.cancel')}
          </button>
          <button type="submit" disabled={isCreating} className="btn-primary">
            {isCreating ? t('components.submitting') : t('components.submitReview')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReviewForm;
