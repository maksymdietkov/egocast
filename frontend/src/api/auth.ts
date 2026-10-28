export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  pictureUrl: string | null;
}

export const GOOGLE_LOGIN_URL = '/oauth2/authorization/google';

/** Текущий пользователь или null, если не залогинен. */
export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch('/api/v1/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`auth/me failed: ${res.status}`);
  return res.json();
}

function readCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function logout(): Promise<void> {
  const token = readCsrfToken();
  const res = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: token ? { 'X-XSRF-TOKEN': token } : {},
  });
  if (!res.ok) throw new Error(`logout failed: ${res.status}`);
}