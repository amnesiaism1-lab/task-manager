import { ERROR_CODES } from './error-codes.js';

const knownErrorCodes = new Set(Object.values(ERROR_CODES));

export function createApiClient(getConnection, onUnauthorized) {
  return async function request(path, options = {}) {
    const connection = getConnection();
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(connection.token ? { Authorization: `Bearer ${connection.token}` } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    const url = `${connection.api}${path.startsWith('/') ? path : `/${path}`}`;

    let response;
    try {
      response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });
    } catch (err) {
      throw new ApiError(0, `Network error: Could not reach backend server at ${connection.api}.`);
    }

    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    if (response.status === 204) return null;

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new ApiError(response.status, text, data);
    }

    return data;
  };
}

export class ApiError extends Error {
  constructor(status, rawBody, parsedData = null) {
    let parsed = parsedData;
    if (!parsed && rawBody) {
      try { parsed = JSON.parse(rawBody); } catch { parsed = null; }
    }

    const code = parsed?.code ?? parsed?.errorCode;
    const message =
      (Array.isArray(parsed?.message) ? parsed.message.join(', ') : parsed?.message) ||
      (knownErrorCodes.has(code) ? code : rawBody) ||
      'Request failed';

    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = knownErrorCodes.has(code) ? code : undefined;
    this.details = parsed;
  }
}

import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

export function handleUnauthorized() {
  store.setState({ token: '', user: null, authMode: 'login' });
  showToast('Session expired or unauthorized. Please sign in.', 'error');
}

export const request = createApiClient(
  () => ({ api: store.getState().api, token: store.getState().token }),
  () => handleUnauthorized()
);

