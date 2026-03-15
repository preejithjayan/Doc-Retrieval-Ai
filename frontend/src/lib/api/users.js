import { apiClient } from './client';

export const usersApi = {
  me: () => apiClient.get('/users/me'),
  updateMe: (payload) => apiClient.patch('/users/me', payload),
  list: (params) => apiClient.get('/users/', { params }),
  create: (payload) => apiClient.post('/users/', payload),
  update: (id, payload) => apiClient.put(`/users/${id}`, payload),
  remove: (id) => apiClient.delete(`/users/${id}`),
};

