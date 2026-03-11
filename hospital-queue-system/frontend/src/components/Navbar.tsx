import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth } from '../services/authStore';
import { getTheme, toggleTheme } from '../services/themeStore';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [theme, setTheme] = useState(() => getTheme());

  return (
    <div className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-opacity hover:opacity-80">
          WaitWise
        </Link>

        <div className="flex items-center gap-3 text-sm font-medium">
          <Link to="/" className="rounded-lg px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50">
            Home
          </Link>
          <Link to="/queue/live" className="rounded-lg px-2.5 py-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50">
            Live Queue
          </Link>

          <button
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setTheme(toggleTheme())}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!auth ? (
            <>
              <Link to="/patient/login" className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                Patient
              </Link>
              <Link to="/doctor/login" className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                Doctor
              </Link>
              <Link to="/admin/login" className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                Admin
              </Link>
            </>
          ) : (
            <>
              {auth.user.role === 'doctor' ? (
                <Link
                  to="/doctor/dashboard"
                  className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                >
                  Dashboard
                </Link>
              ) : auth.user.role === 'patient' ? (
                <Link
                  to="/patient/dashboard"
                  className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/admin/dashboard"
                  className="text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                >
                  Dashboard
                </Link>
              )}
              <button
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={() => {
                  clearAuth();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
