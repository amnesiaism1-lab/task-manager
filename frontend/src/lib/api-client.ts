import { ERROR_CODES } from '@task-manager/shared';

const knownErrorCodes = new Set(Object.values(ERROR_CODES));
const inFlightRequests = new Map<string, Promise<any>>();
const getResponseCache = new Map<string, { data: any; time: number }>();
const CACHE_TTL = 2000; // 2 seconds micro-cache for identical GETs

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(status: number, rawBody: string, parsedData: any = null) {
    let parsed = parsedData;
    if (!parsed && rawBody) {
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        parsed = null;
      }
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

export function invalidateApiCache() {
  getResponseCache.clear();
}

function getDefaultApiUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3001/api';
  const stored = localStorage.getItem('tm_api');
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (stored) {
    if (!isLocal && stored.includes('localhost:3001')) {
      return '/api';
    }
    return stored;
  }
  return isLocal ? 'http://localhost:3001/api' : '/api';
}

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorizedCallback = cb;
}

export async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tm_token') : null;
  const baseUrl = getDefaultApiUrl();
  const isFormData = options.body instanceof FormData;
  const method = (options.method || 'GET').toUpperCase();

  if (method !== 'GET') {
    getResponseCache.clear();
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;
  const cacheKey = `${method}:${url}:${token || ''}`;

  if (method === 'GET') {
    const cached = getResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    let response: Response;
    try {
      response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
      });
    } catch {
      throw new ApiError(0, `Network error: Could not reach backend server at ${baseUrl}.`);
    } finally {
      inFlightRequests.delete(cacheKey);
    }

    if (response.status === 401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }

    if (response.status === 204) return null as unknown as T;

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new ApiError(response.status, text, data);
    }

    if (method === 'GET' && data !== undefined) {
      getResponseCache.set(cacheKey, { data, time: Date.now() });
    }

    return data as T;
  })();

  if (method === 'GET') {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}
