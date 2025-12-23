import apiClient from './api';

export const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    return apiClient.get('/user/stats');
  },

  // Reviews management
  deleteReview: async (reviewId) => {
    return apiClient.put(`/review/${reviewId}/delete_review`);
  },

  // Users management
  getUsers: async (page = 1, perPage = 10) => {
    return apiClient.get(`/user/all?page=${page}&per_page=${perPage}`);
  },

  createUser: async (userData, roleId) => {
    const payload = { user: userData };
    if (roleId) payload.role_id = roleId;
    return apiClient.post('/user', payload);
  },

  updateUserRole: async (userId, roleId) => {
    return apiClient.put(`/user/${userId}/update_role`, { role_id: roleId });
  },

  deleteUser: async (userId) => {
    return apiClient.put(`/user/${userId}/delete_user`);
  },

  // Companies management
  deleteCompany: async (companyId) => {
    return apiClient.put(`/company/${companyId}/delete_company`);
  },

  // Roles management
  getRoles: async () => {
    return apiClient.get('/role');
  },

  createRole: async (roleData) => {
    return apiClient.post('/role', { role: roleData });
  },

  updateRole: async (roleId, roleData) => {
    return apiClient.put(`/role/${roleId}`, { role: roleData });
  },

  deleteRole: async (roleId) => {
    return apiClient.put(`/role/${roleId}/delete_role`);
  },
};

export default adminService;
