import apiClient from './api';

export const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    return apiClient.get('/user/stats');
  },

  // Admin stats with activity data
  getAdminStats: async () => {
    return apiClient.get('/stats/admin');
  },

  // Admin activities log
  getAdminActivities: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.perPage) params.append('per_page', options.perPage);
    if (options.actionType) params.append('action_type', options.actionType);
    if (options.resourceType) params.append('resource_type', options.resourceType);
    return apiClient.get(`/stats/admin_activities?${params.toString()}`);
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
  getAllCompanies: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.perPage) params.append('per_page', options.perPage);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.sortOrder) params.append('sort_order', options.sortOrder);
    if (options.status) params.append('status', options.status);
    if (options.includeDeleted) params.append('include_deleted', 'true');
    return apiClient.get(`/company/all?${params.toString()}`);
  },

  createCompany: async (companyData) => {
    return apiClient.post('/company', { company: companyData });
  },

  updateCompany: async (companyId, companyData) => {
    return apiClient.put(`/company/${companyId}`, { company: companyData });
  },

  deleteCompany: async (companyId) => {
    return apiClient.put(`/company/${companyId}/delete_company`);
  },

  restoreCompany: async (companyId) => {
    return apiClient.put(`/company/${companyId}/restore`);
  },

  updateCompanyStatus: async (companyId, status) => {
    return apiClient.put(`/company/${companyId}/update_status`, status);
  },

  // Roles management
  getRoles: async () => {
    return apiClient.get('/role');
  },

  getRole: async (roleId) => {
    return apiClient.get(`/role/${roleId}`);
  },

  createRole: async (roleData) => {
    return apiClient.post('/role', { role: roleData });
  },

  updateRole: async (roleId, roleData) => {
    return apiClient.put(`/role/${roleId}`, { role: roleData });
  },

  updateRoleStatus: async (roleId, status) => {
    return apiClient.put(`/role/${roleId}/update_status`, { status });
  },

  updateRolePermissions: async (roleId, permissions) => {
    return apiClient.put(`/role/${roleId}/update_permissions`, { permissions });
  },

  deleteRole: async (roleId) => {
    return apiClient.put(`/role/${roleId}/delete_role`);
  },

  getAvailablePermissions: async () => {
    return apiClient.get('/role/available_permissions');
  },
};

export default adminService;
