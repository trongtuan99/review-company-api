import { useState } from 'react';
import { useReviewMutationsExtended } from '../hooks/useReviewMutationsExtended';
import StarRating from './StarRating';
import './CreateReviewForm.css';

const CreateReviewForm = ({ companyId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    reviews_content: '',
    score: 5,
    job_title: '',
    custom_job_title: '',
    is_anonymous: false,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || formData.title.length < 5) {
      setError('Tiêu đề phải có ít nhất 5 ký tự');
      return;
    }

    try {
      const submitData = {
        ...formData,
        job_title: formData.job_title === 'Other' ? formData.custom_job_title : formData.job_title,
      };
      delete submitData.custom_job_title;
      
      await createReview({ companyId, reviewData: submitData });
      onSuccess?.();
      setFormData({ title: '', reviews_content: '', score: 5, job_title: '', custom_job_title: '', is_anonymous: false });
    } catch (err) {
      setError(err.message || err.error || 'Không thể tạo đánh giá');
    }
  };

  return (
    <div className="create-review-form">
      <h3>Viết đánh giá</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tiêu đề *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={100}
            placeholder="Tiêu đề đánh giá..."
          />
        </div>
        <div className="form-group">
          <label>Điểm đánh giá (1-10)</label>
          <StarRating
            value={formData.score}
            onChange={(score) => setFormData({ ...formData, score })}
          />
        </div>
        <div className="form-group">
          <label>Chức danh công việc tại công ty này</label>
          <select
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">-- Chọn chức danh --</option>
            {commonJobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          {formData.job_title === 'Other' && (
            <input
              type="text"
              name="custom_job_title"
              value={formData.custom_job_title}
              onChange={handleChange}
              placeholder="Nhập chức danh của bạn..."
              className="form-input"
              style={{ marginTop: '8px' }}
            />
          )}
        </div>
        <div className="form-group">
          <label>Nội dung đánh giá</label>
          <textarea
            name="reviews_content"
            value={formData.reviews_content}
            onChange={handleChange}
            rows={5}
            placeholder="Chia sẻ trải nghiệm của bạn..."
          />
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
            />
            <span>Đánh giá ẩn danh</span>
          </label>
          <p className="form-hint">Nếu chọn, tên của bạn sẽ không được hiển thị công khai</p>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Hủy
          </button>
          <button type="submit" disabled={isCreating} className="btn-primary">
            {isCreating ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReviewForm;

