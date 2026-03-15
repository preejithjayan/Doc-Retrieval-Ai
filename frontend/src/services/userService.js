import api from './api';

const userService = {
  list: () => api.get('/users/'),
  create: (payload) => api.post('/users/', payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  remove: (id) => api.delete(`/users/${id}`),
};

export default userService;

