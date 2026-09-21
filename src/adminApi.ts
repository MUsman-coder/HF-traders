import { API_BASE_URL } from './api';

const TOKEN_KEY = 'hf_traders_admin_token';
const IDENTITY_KEY = 'hf_traders_admin_identity';
const LOGIN_AT_KEY = 'hf_traders_admin_login_at';
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface AdminIdentity {
  name: string;
  email: string;
}

/** Returns the token only if it exists AND the session hasn't expired. */
export function getAdminToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const loginAt = Number(sessionStorage.getItem(LOGIN_AT_KEY) || 0);
  if (!loginAt || Date.now() - loginAt > SESSION_MAX_AGE_MS) {
    clearAdminToken();
    return null;
  }

  return token;
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(IDENTITY_KEY);
  sessionStorage.removeItem(LOGIN_AT_KEY);
}

export function getAdminIdentity(): AdminIdentity | null {
  const raw = sessionStorage.getItem(IDENTITY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminIdentity(identity: AdminIdentity): void {
  sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

interface AdminApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
}

/**
 * Like apiRequest, but attaches the admin token header. Throws a special
 * 'UNAUTHORIZED' error the caller can check for to redirect to admin login.
 */
export async function adminApiRequest<T>(path: string, options: AdminApiOptions = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const res = await fetch(`${API_BASE_URL}/admin${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      'x-admin-token': token,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAdminToken();
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }

  return data as T;
}
