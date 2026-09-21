export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api';

interface ApiOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
}

/**
 * Small fetch wrapper: builds the full URL, sends JSON, and throws with the
 * server's error message on non-2xx responses so callers can catch() it.
 */
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }

  return data as T;
}
