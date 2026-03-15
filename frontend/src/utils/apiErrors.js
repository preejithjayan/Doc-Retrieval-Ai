const HTML_DOCUMENT_PATTERN = /^\s*<(?:!doctype|html)\b/i;

export const API_UNREACHABLE_MESSAGE =
  'Unable to reach the API. Check that the backend is running and VITE_API_BASE_URL points to it.';

export const API_HTML_RESPONSE_MESSAGE =
  'The API returned HTML instead of JSON. Check the backend URL or proxy configuration.';

export const INVALID_AUTH_RESPONSE_MESSAGE =
  'The API returned an unexpected authentication response. Check the backend URL or proxy configuration.';

export const API_CONFIG_REQUIRED_MESSAGE =
  'This preview has no backend configured. Set VITE_API_BASE_URL to a live Django API before using login or registration.';

export function isHtmlDocument(value) {
  return typeof value === 'string' && HTML_DOCUMENT_PATTERN.test(value);
}

export function hasHtmlResponse(response) {
  const contentType = String(response?.headers?.['content-type'] ?? '').toLowerCase();
  return contentType.includes('text/html') || isHtmlDocument(response?.data);
}

export function createApiError(detail, options = {}) {
  const status = options.response?.status ?? options.status ?? 0;
  const error = new Error(detail);
  error.name = 'ApiError';
  error.code = options.code ?? 'API_ERROR';
  error.response = {
    ...(options.response ?? {}),
    status,
    data: {
      success: false,
      errors: {
        detail,
      },
      status_code: status,
    },
  };
  return error;
}

export function isPreviewWithoutApiConfig() {
  if (typeof window === 'undefined') {
    return false;
  }

  const host = window.location.hostname.toLowerCase();
  const explicitApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return !explicitApiBaseUrl && host.endsWith('vercel.app');
}

export function ensureApiIsConfigured() {
  if (isPreviewWithoutApiConfig()) {
    throw createApiError(API_CONFIG_REQUIRED_MESSAGE, {
      code: 'API_CONFIG_REQUIRED',
    });
  }
}

export function ensureApiResponse(response) {
  if (hasHtmlResponse(response)) {
    throw createApiError(API_HTML_RESPONSE_MESSAGE, {
      response,
      code: 'API_HTML_RESPONSE',
    });
  }

  return response;
}

export function normalizeApiError(error) {
  if (error?.response?.data?.errors) {
    return error;
  }

  if (hasHtmlResponse(error?.response)) {
    return createApiError(API_HTML_RESPONSE_MESSAGE, {
      response: error.response,
      code: 'API_HTML_RESPONSE',
    });
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return createApiError(API_UNREACHABLE_MESSAGE, {
      code: 'API_UNREACHABLE',
    });
  }

  if (typeof error?.response?.data?.detail === 'string') {
    return createApiError(error.response.data.detail, {
      response: error.response,
      code: error.code,
    });
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return createApiError(error.message, {
      response: error.response,
      code: error.code,
    });
  }

  return createApiError('The API request failed.', {
    response: error?.response,
    code: error?.code,
  });
}

export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const normalizedError = normalizeApiError(error);
  const errors = normalizedError?.response?.data?.errors;

  if (!errors) {
    return fallback;
  }

  if (typeof errors.detail === 'string' && errors.detail.trim()) {
    return errors.detail;
  }

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
      return value[0];
    }

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
}

export function ensureAuthPayload(data) {
  if (data?.access && data?.refresh && data?.user) {
    return data;
  }

  throw createApiError(INVALID_AUTH_RESPONSE_MESSAGE, {
    code: 'INVALID_AUTH_RESPONSE',
  });
}
