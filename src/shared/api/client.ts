import { env } from '@/shared/config/env';
import type { ApiErrorBody, ApiFailureEnvelope, ApiSuccessEnvelope } from './types';

const TOKEN_KEY = 'crm_auth_token';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown | undefined;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

function getBaseUrl(): string {
  return env.VITE_API_BASE_URL.replace(/\/$/, '');
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...init } = options;
  const headers = new Headers(init.headers);

  if (init.body !== undefined && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const credentialsMode = env.VITE_AUTH_HTTPONLY_COOKIE ? 'include' : 'same-origin';

  const res = await fetch(`${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
    credentials: init.credentials ?? credentialsMode,
  });

  if (res.status === 204 || res.status === 205) {
    if (!res.ok) {
      throw new ApiError(res.status, 'HTTP_ERROR', res.statusText);
    }
    return undefined as T;
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  const body = json as ApiSuccessEnvelope<T> | ApiFailureEnvelope | Record<string, unknown> | null;

  if (body && typeof body === 'object' && 'success' in body && body.success === false) {
    const err = (body as ApiFailureEnvelope).error;
    throw new ApiError(res.status, err?.code ?? 'UNKNOWN', err?.message ?? '', err?.details);
  }

  if (!res.ok) {
    const err =
      body && typeof body === 'object' && 'error' in body
        ? (body as { error?: ApiErrorBody }).error
        : undefined;
    throw new ApiError(
      res.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? res.statusText,
      err?.details
    );
  }

  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    body.success === true &&
    'data' in body
  ) {
    return (body as ApiSuccessEnvelope<T>).data;
  }

  throw new ApiError(res.status, 'INVALID_RESPONSE', '');
}
