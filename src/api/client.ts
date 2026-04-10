import type { ApiError } from './types/api.types';

const BASE: string = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function handleRes<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T;

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg = data?.error || data || res.statusText;
    const error: ApiError = { error: errorMsg, status: res.status };
    throw error;
  }

  return data as T;
}

export async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return handleRes<T>(res);
}