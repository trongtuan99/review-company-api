import { useTranslation } from 'react-i18next';
import './ReplyItem.css';

const ReplyItem = ({ reply, onUpdate }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="reply-item">
      <div className="reply-content">
        <p>{reply.content}</p>
        {reply.is_edited && <span className="edited-badge">{t('components.edited')}</span>}
      </div>
      <div className="reply-meta">
        <span>{t('components.user')}</span>
        <span>{new Date(reply.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</span>
      </div>
    </div>
  );
};

export default ReplyItem;
