import apiClient from './api';

// User Services
export const userService = {
  // Get user details
  getUser: async (userId) => {
    return await apiClient.get(`/user/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    return await apiClient.put(`/user/${userId}/update_profile`, profileData);
  },

  // Delete user (Soft delete)
  deleteUser: async (userId) => {
    return await apiClient.put(`/user/${userId}/delete_user`);
  },

  // Get user activity stats (current user)
  getActivityStats: async () => {
    return await apiClient.get(`/user/activity_stats`);
  },

  // Get recent comments/replies (current user)
  getRecentComments: async (limit = 10) => {
    return await apiClient.get(`/user/recent_comments?limit=${limit}`);
  },
};

