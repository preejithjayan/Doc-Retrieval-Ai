import apiClient from './client';

export async function login(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
}

export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function logout(payload) {
  const { data } = await apiClient.post('/auth/logout', payload);
  return data;
}

export async function requestPasswordReset(payload) {
  const { data } = await apiClient.post('/auth/password-reset', payload);
  return data;
}

export async function confirmPasswordReset(payload) {
  const { data } = await apiClient.post('/auth/password-reset/confirm', payload);
  return data;
}

export async function getSession() {
  const { data } = await apiClient.get('/auth/session');
  return data;
}
