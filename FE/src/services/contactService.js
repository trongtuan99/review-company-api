import apiClient from './api';

export const contactService = {
  // Send contact message (public)
  sendMessage: async (messageData) => {
    return apiClient.post('/contact', { contact_message: messageData });
  },

  // Get all contact messages (admin)
  getMessages: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.perPage) params.append('per_page', options.perPage);
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.sortOrder) params.append('sort_order', options.sortOrder);
    return apiClient.get(`/contact?${params.toString()}`);
  },

  // Get single message (admin)
  getMessage: async (id) => {
    return apiClient.get(`/contact/${id}`);
  },

  // Update message status (admin)
  updateStatus: async (id, status) => {
    return apiClient.put(`/contact/${id}`, { status });
  },

  // Delete message (admin)
  deleteMessage: async (id) => {
    return apiClient.delete(`/contact/${id}`);
  },

  // Mark as read (admin)
  markAsRead: async (id) => {
    return apiClient.put(`/contact/${id}/read`);
  },

  // Reply to message (admin)
  replyMessage: async (id, replyContent) => {
    return apiClient.post(`/contact/${id}/reply`, { reply: replyContent });
  },
};

export default contactService;
