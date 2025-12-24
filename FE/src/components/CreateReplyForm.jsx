import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReplyMutations } from '../hooks/useReplyMutations';
import './CreateReplyForm.css';

const CreateReplyForm = ({ reviewId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { createReply, isCreating } = useReplyMutations(reviewId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError(t('components.enterReplyContent'));
      return;
    }

    try {
      await createReply(content);
      onSuccess?.();
      setContent('');
    } catch (err) {
      setError(err.message || err.error || t('components.cannotCreateReply'));
    }
  };

  return (
    <div className="create-reply-form">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('components.writeReply')}
          rows={3}
          required
        />
        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              {t('common.cancel')}
            </button>
          )}
          <button type="submit" disabled={isCreating} className="btn-primary">
            {isCreating ? t('common.sending') : t('components.sendReply')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateReplyForm;
