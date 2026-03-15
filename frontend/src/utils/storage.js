const AUTH_STORAGE_KEY = 'documind_auth';

export function getStoredAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(payload) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken() {
  return getStoredAuth()?.accessToken ?? null;
}

export function getRefreshToken() {
  return getStoredAuth()?.refreshToken ?? null;
}

export function getStoredUser() {
  return getStoredAuth()?.user ?? null;
}
