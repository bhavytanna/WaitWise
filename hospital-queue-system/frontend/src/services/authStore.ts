export type AuthUser = {
  id: string;
  username: string;
  role: 'doctor' | 'admin' | 'patient';
  doctorId?: string;
};

type AuthState = {
  token: string;
  user: AuthUser;
};

const KEY = 'hq.auth';

export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuth(state: AuthState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
