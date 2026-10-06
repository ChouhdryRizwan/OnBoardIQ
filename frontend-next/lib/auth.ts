import { UserRole, User } from '../types';

const TOKEN_STORAGE_KEY = 'onboardiq_auth_token';
const ROLE_STORAGE_KEY = 'onboardiq_user_role';
const USER_STORAGE_KEY = 'onboardiq_current_user';

const LEGACY_TOKEN_STORAGE_KEY = 'skillsprint_auth_token';
const LEGACY_ROLE_STORAGE_KEY = 'skillsprint_user_role';
const LEGACY_USER_STORAGE_KEY = 'skillsprint_current_user';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) return token;
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY);
  if (legacyToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken);
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    return legacyToken;
  }
  return null;
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const getStoredRole = (): UserRole => {
  if (typeof window === 'undefined') return 'employee';
  const role = localStorage.getItem(ROLE_STORAGE_KEY);
  if (role) return role as UserRole;
  const legacyRole = localStorage.getItem(LEGACY_ROLE_STORAGE_KEY);
  if (legacyRole) {
    localStorage.setItem(ROLE_STORAGE_KEY, legacyRole);
    localStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
    return legacyRole as UserRole;
  }
  return 'employee';
};

export const setStoredRole = (role: UserRole): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
  localStorage.setItem(ROLE_STORAGE_KEY, role);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  let raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    const legacyRaw = localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    if (legacyRaw) {
      raw = legacyRaw;
      localStorage.setItem(USER_STORAGE_KEY, legacyRaw);
      localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
    }
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
};
