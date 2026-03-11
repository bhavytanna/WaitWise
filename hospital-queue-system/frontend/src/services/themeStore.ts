export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'shq.theme';

export function getTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === 'dark' ? 'dark' : 'light';
}

export function setTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  setTheme(getTheme());
}
