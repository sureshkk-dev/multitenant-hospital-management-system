export type UserRole = 'superAdmin' | 'hospitalAdmin';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  /** Present for hospitalAdmin after login */
  hospitalSubdomain?: string;
};

const TOKEN_KEY = 'mt_access_token';
const USER_KEY = 'mt_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY);
}

