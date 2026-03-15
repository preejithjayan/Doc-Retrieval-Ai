import { apiClient } from './client';

export const chatApi = {
  history: () => apiClient.get('/chat/history'),
  query: (payload) => apiClient.post('/chat/query', payload),
};

