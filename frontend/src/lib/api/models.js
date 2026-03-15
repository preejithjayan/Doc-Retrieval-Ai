import { apiClient } from './client';

export const modelsApi = {
  current: () => apiClient.get('/models/current'),
  switch: (payload) => apiClient.post('/models/switch', payload),
};

