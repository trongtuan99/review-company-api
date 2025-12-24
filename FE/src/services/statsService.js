import apiClient from './api';

export const statsService = {
  // Get public platform stats
  getStats: async () => {
    return apiClient.get('/stats');
  },
};
