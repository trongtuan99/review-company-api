import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { contactService } from '../../services/contactService';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const AdminContactMessages = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: searchParams.get('status') || 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const debounceTimer = useRef(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadMessages();
  }, [filter.status, filter.sortBy, filter.sortOrder, filter.page, filter.search]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (searchInput !== filter.search) {
        setFilter(prev => ({ ...prev, search: searchInput, page: 1 }));
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await contactService.getMessages({
        page: filter.page,
        perPage: 10,
        status: filter.status,
        search: filter.search,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
      });
      setMessages(response.data || []);
      setPagination({
        total: response.pagination?.total || 0,
        pages: response.pagination?.total_pages || 1,
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setFilter(prev => ({ ...prev, status, page: 1 }));
    setSearchParams(status === 'all' ? {} : { status });
  };

  const handleSortChange = (sortBy) => {
    setFilter(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilter(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleViewDetail = async (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    if (message.status === 'unread') {
      try {
        await contactService.markAsRead(message.id);
        setMessages(prev => prev.map(m =>
          m.id === message.id ? { ...m, status: 'read' } : m
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleDelete = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMessage) return;
    try {
      await contactService.deleteMessage(selectedMessage.id);
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    setReplying(true);
    try {
      await contactService.replyMessage(selectedMessage.id, replyContent);
      setMessages(prev => prev.map(m =>
        m.id === selectedMessage.id ? { ...m, status: 'replied' } : m
      ));
      setReplyContent('');
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setReplying(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      unread: { class: 'status-pending', label: t('admin.contactMessages.unread') },
      read: { class: 'status-active', label: t('admin.contactMessages.read') },
      replied: { class: 'status-approved', label: t('admin.contactMessages.replied') },
    };
    const s = statusMap[status] || { class: 'status-pending', label: status };
    return <span className={`status-badge ${s.class}`}>{s.label}</span>;
  };

  const getSubjectLabel = (subject) => {
    const subjectMap = {
      general: t('pages.contact.subjectGeneral'),
      support: t('pages.contact.subjectSupport'),
      feedback: t('pages.contact.subjectFeedback'),
      business: t('pages.contact.subjectBusiness'),
      report: t('pages.contact.subjectReport'),
      other: t('pages.contact.subjectOther'),
    };
    return subjectMap[subject] || subject;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'vi' ? 'vi-VN' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>{t('admin.contactMessages.title')}</h1>
        <p>{t('admin.contactMessages.description')}</p>
      </div>

      <div className="admin-filters">
        <div className="filter-group">
          <label>{t('admin.status')}:</label>
          <div className="filter-buttons">
            {['all', 'unread', 'read', 'replied'].map(status => (
              <button
                key={status}
                className={filter.status === status ? 'active' : ''}
                onClick={() => handleStatusChange(status)}
              >
                {status === 'all' ? t('admin.all') : t(`admin.contactMessages.${status}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <input
            type="text"
            placeholder={t('admin.contactMessages.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="refresh-btn" onClick={loadMessages}>
          {t('admin.refresh')}
        </button>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : messages.length === 0 ? (
          <div className="no-data">{t('admin.contactMessages.noMessages')}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => handleSortChange('name')} className="sortable">
                  {t('admin.contactMessages.sender')}
                  {filter.sortBy === 'name' && (filter.sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>{t('pages.contact.subject')}</th>
                <th>{t('admin.contactMessages.preview')}</th>
                <th>{t('admin.status')}</th>
                <th onClick={() => handleSortChange('created_at')} className="sortable">
                  {t('admin.createdAt')}
                  {filter.sortBy === 'created_at' && (filter.sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(message => (
                <tr key={message.id} className={message.status === 'unread' ? 'unread-row' : ''}>
                  <td>
                    <div className="sender-info">
                      <strong>{message.name}</strong>
                      <small>{message.email}</small>
                    </div>
                  </td>
                  <td>{getSubjectLabel(message.subject)}</td>
                  <td className="message-preview">
                    {message.message?.substring(0, 50)}...
                  </td>
                  <td>{getStatusBadge(message.status)}</td>
                  <td>{formatDate(message.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetail(message)}
                        title={t('admin.viewDetail')}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(message)}
                        title={t('common.delete')}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(filter.page - 1)}
            disabled={filter.page === 1}
          >
            {t('common.previous')}
          </button>
          <span>
            {t('admin.page')} {filter.page} / {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(filter.page + 1)}
            disabled={filter.page === pagination.pages}
          >
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.contactMessages.messageDetail')}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>{t('admin.contactMessages.sender')}:</label>
                <span>{selectedMessage.name} ({selectedMessage.email})</span>
              </div>
              <div className="detail-row">
                <label>{t('pages.contact.subject')}:</label>
                <span>{getSubjectLabel(selectedMessage.subject)}</span>
              </div>
              <div className="detail-row">
                <label>{t('admin.status')}:</label>
                {getStatusBadge(selectedMessage.status)}
              </div>
              <div className="detail-row">
                <label>{t('admin.createdAt')}:</label>
                <span>{formatDate(selectedMessage.created_at)}</span>
              </div>
              <div className="detail-row full-width">
                <label>{t('pages.contact.content')}:</label>
                <div className="message-content">{selectedMessage.message}</div>
              </div>

              {selectedMessage.status !== 'replied' && (
                <div className="reply-section">
                  <label>{t('admin.contactMessages.replyLabel')}:</label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={t('admin.contactMessages.replyPlaceholder')}
                    rows={4}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleReply}
                    disabled={replying || !replyContent.trim()}
                  >
                    {replying ? t('common.sending') : t('admin.contactMessages.sendReply')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmDelete}
        title={t('admin.contactMessages.deleteTitle')}
        message={t('admin.contactMessages.deleteConfirm')}
        type="danger"
      />
    </div>
  );
};

export default AdminContactMessages;
