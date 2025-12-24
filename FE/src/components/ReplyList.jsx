import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { replyService } from '../services/replyService';
import ReplyItem from './ReplyItem';
import './ReplyList.css';

const ReplyList = ({ reviewId, refreshKey }) => {
  const { t } = useTranslation();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReplies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await replyService.getReplies(reviewId);

      if (response && (response.status === 'ok' || response.status === 'success')) {
        const repliesData = response.data || [];
        setReplies(repliesData);
      } else {
        setReplies([]);
      }
    } catch {
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    loadReplies();
  }, [loadReplies, refreshKey]);

  return (
    <div className="reply-list-container">
      {loading ? (
        <div className="loading-replies">{t('common.loading')}</div>
      ) : !replies || replies.length === 0 ? (
        <div className="empty-replies">{t('components.noReplies')}</div>
      ) : (
        <div className="reply-list">
          {replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} onUpdate={loadReplies} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyList;
