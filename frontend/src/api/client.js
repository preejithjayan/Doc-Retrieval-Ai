import axios from 'axios';

import { clearStoredAuth, getAccessToken, getRefreshToken, getStoredAuth, setStoredAuth } from '../utils/storage';
import { ensureApiIsConfigured, ensureApiResponse, normalizeApiError } from '../utils/apiErrors';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let pendingQueue = [];

function processPendingQueue(error, accessToken = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(accessToken);
  });
  pendingQueue = [];
}

function forceLogout() {
  clearStoredAuth();
  window.dispatchEvent(new Event('auth:logout'));
}

apiClient.interceptors.request.use((config) => {
  ensureApiIsConfigured();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => ensureApiResponse(response),
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const refreshToken = getRefreshToken();
    const normalizedError = normalizeApiError(error);
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(normalizedError);
    }

    if (!refreshToken) {
      forceLogout();
      return Promise.reject(normalizedError);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = ensureApiResponse(
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {
            refresh: refreshToken,
          },
          {
            headers: {
              Accept: 'application/json',
            },
          },
        ),
      );

      const nextAccessToken = refreshResponse.data.access;
      const nextRefreshToken = refreshResponse.data.refresh ?? refreshToken;
      const currentAuth = getStoredAuth() ?? {};

      setStoredAuth({
        ...currentAuth,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });

      processPendingQueue(null, nextAccessToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      const normalizedRefreshError = normalizeApiError(refreshError);
      processPendingQueue(normalizedRefreshError);
      forceLogout();
      return Promise.reject(normalizedRefreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
