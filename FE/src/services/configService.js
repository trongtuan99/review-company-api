import apiClient from './api';

export const configService = {
  // Get public configs (no auth required)
  getPublicConfigs: async () => {
    return apiClient.get('/site_config/public_configs');
  },

  // Get all configs (admin only)
  getAllConfigs: async (category = null) => {
    const params = category ? `?category=${category}` : '';
    return apiClient.get(`/site_config${params}`);
  },

  // Get config categories
  getCategories: async () => {
    return apiClient.get('/site_config/categories');
  },

  // Update single config
  updateConfig: async (id, data) => {
    return apiClient.put(`/site_config/${id}`, { site_config: data });
  },

  // Bulk update configs
  bulkUpdateConfigs: async (configs) => {
    return apiClient.put('/site_config/bulk_update', { configs });
  },

  // Create new config
  createConfig: async (data) => {
    return apiClient.post('/site_config', { site_config: data });
  },

  // Delete config
  deleteConfig: async (id) => {
    return apiClient.delete(`/site_config/${id}`);
  },
};
