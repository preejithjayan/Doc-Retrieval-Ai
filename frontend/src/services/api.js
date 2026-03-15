import axios from 'axios';

import { clearStoredUser, clearTokens, getAccessToken, getRefreshToken, setTokens } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && getRefreshToken()) {
      originalRequest._retry = true;
      refreshPromise = refreshPromise || axios.post(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`, {
        refresh: getRefreshToken(),
      });

      try {
        const { data } = await refreshPromise;
        setTokens(data.access, data.refresh || getRefreshToken());
        refreshPromise = null;
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        clearTokens();
        clearStoredUser();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;

