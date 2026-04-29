import type { ApiError } from './types/api.types';

const BASE: string = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`;

async function handleRes<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T;

  const newToken = res.headers.get('x-new-token');
  if (newToken) {
    localStorage.setItem('token', newToken);
  }

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    window.dispatchEvent(new Event('auth:logout'));
  }

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
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  return handleRes<T>(res);
}

export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw { error: res.statusText, status: res.status };

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}