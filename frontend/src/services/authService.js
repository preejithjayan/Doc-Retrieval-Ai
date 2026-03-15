import api from './api';

const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: (payload) => api.post('/auth/logout', payload),
  session: () => api.get('/auth/session'),
  requestPasswordReset: (payload) => api.post('/auth/password-reset', payload),
  confirmPasswordReset: (payload) => api.post('/auth/password-reset/confirm', payload),
};

export default authService;

