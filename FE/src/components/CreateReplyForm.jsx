import { useState } from 'react';
import { useReplyMutations } from '../hooks/useReplyMutations';
import './CreateReplyForm.css';

const CreateReplyForm = ({ reviewId, onSuccess, onCancel }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { createReply, isCreating } = useReplyMutations(reviewId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      await createReply(content);
      onSuccess?.();
      setContent('');
    } catch (err) {
      setError(err.message || err.error || 'Không thể tạo trả lời');
    }
  };

  return (
    <div className="create-reply-form">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết trả lời..."
          rows={3}
          required
        />
        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Hủy
            </button>
          )}
          <button type="submit" disabled={isCreating} className="btn-primary">
            {isCreating ? 'Đang gửi...' : 'Gửi trả lời'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReplyForm;

