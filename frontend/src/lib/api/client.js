import axios from 'axios';

import { useAuthStore } from '../../stores/authStore';
import { ensureApiIsConfigured, ensureApiResponse, normalizeApiError } from '../../utils/apiErrors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25_000,
  headers: {
    Accept: 'application/json',
  },
});

publicClient.interceptors.response.use(
  (response) => ensureApiResponse(response),
  (error) => Promise.reject(normalizeApiError(error)),
);

publicClient.interceptors.request.use((config) => {
  ensureApiIsConfigured();
  return config;
});

apiClient.interceptors.request.use((config) => {
  ensureApiIsConfigured();
  const access = useAuthStore.getState().tokens?.access;
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => ensureApiResponse(response),
  async (error) => {
    const originalRequest = error.config || {};
    const refresh = useAuthStore.getState().tokens?.refresh;
    const normalizedError = normalizeApiError(error);

    if (error.response?.status === 401 && refresh && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshPromise =
        refreshPromise || publicClient.post('/auth/refresh', { refresh }).finally(() => {
          refreshPromise = null;
        });

      try {
        const { data } = await refreshPromise;
        useAuthStore.getState().refreshToken(data.access, data.refresh || refresh);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(normalizeApiError(refreshError));
      }
    }

    return Promise.reject(normalizedError);
  },
);
