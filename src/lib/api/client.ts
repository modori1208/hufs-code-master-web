import { config } from '@/lib/config';
import type { ApiResponse } from './types';

/**
 * 백엔드 API 호출 실패를 표현하는 예외.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseEnvelope<T>(response: Response): Promise<ApiResponse<T> | null> {
  if (response.status === 204) return null;
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${config.apiBaseUrl}${path}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const hasBody = init?.body !== undefined && init.body !== null;
  const response = await fetch(resolveUrl(path), {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  const body = await parseEnvelope<T>(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error_code ?? null,
      body?.message ?? response.statusText,
    );
  }

  return (body?.data ?? null) as T;
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, { ...init, method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = void>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, { ...init, method: 'DELETE' });
}

/**
 * 객체를 URL 쿼리 문자열로 직렬화합니다. undefined/null 값은 무시됩니다.
 */
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
