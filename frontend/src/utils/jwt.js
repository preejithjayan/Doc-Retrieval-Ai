export function decodeJwt(token) {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = window.atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '='));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getTokenExpiry(token) {
  const payload = decodeJwt(token);
  return payload?.exp ? new Date(payload.exp * 1000) : null;
}
