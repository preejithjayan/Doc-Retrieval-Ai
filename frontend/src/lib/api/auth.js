import { publicClient } from './client';

export const authApi = {
  login: (payload) => publicClient.post('/auth/login', payload),
  register: (payload) => publicClient.post('/auth/register', payload),
  forgotPassword: (payload) => publicClient.post('/auth/password-reset', payload),
  resetPassword: (payload) => publicClient.post('/auth/password-reset/confirm', payload),
  logout: (payload) => publicClient.post('/auth/logout', payload),
};

