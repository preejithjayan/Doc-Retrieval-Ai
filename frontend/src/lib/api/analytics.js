import { apiClient } from './client';

export const analyticsApi = {
  overview: () => apiClient.get('/analytics/overview'),
};

