import { Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth, getAuth } from '../services/authStore';
import { getTheme, toggleTheme } from '../services/themeStore';
import { Moon, Sun, LogOut, LayoutDashboard, Ticket, Home } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const [theme, setTheme] = useState(() => getTheme());
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* Backdrop */}
      <div className="border-b border-slate-200/60 bg-white/75 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#080c14]/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/logo.png"
              alt="WaitWise Logo"
              className="h-8 w-8 rounded-xl shadow-lg shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-110 object-cover"
            />
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Wait<span className="gradient-text">Wise</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className={navLinkClass('/')}>
              <Home size={15} /> Home
            </Link>
            <Link to="/queue/live" className={navLinkClass('/queue/live')}>
              <Ticket size={15} /> Live Queue
            </Link>

            {/* Theme Toggle */}
            <button
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100"
              onClick={() => setTheme(toggleTheme())}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Sun size={15} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Moon size={15} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Auth Links */}
            {!auth ? (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  to="/patient/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                >
                  Patient
                </Link>
                <Link
                  to="/doctor/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                >
                  Doctor
                </Link>
                <Link
                  to="/admin/login"
                  className="rounded-lg border border-indigo-200/60 bg-indigo-50/60 px-3 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-200 hover:bg-indigo-100 hover:border-indigo-300 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                >
                  Admin
                </Link>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  to={
                    auth.user.role === 'doctor'
                      ? '/doctor/dashboard'
                      : auth.user.role === 'patient'
                        ? '/patient/dashboard'
                        : '/admin/dashboard'
                  }
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-rose-800/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                  onClick={() => {
                    clearAuth();
                    navigate('/');
                  }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </nav>

          {/* Mobile: theme + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white/80 text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400"
              onClick={() => setTheme(toggleTheme())}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200/80 bg-white/80 dark:border-slate-700/60 dark:bg-slate-800/60"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className={`h-0.5 w-4 rounded bg-slate-600 transition-all duration-200 dark:bg-slate-300 ${mobileOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
              <span className={`h-0.5 w-4 rounded bg-slate-600 transition-all duration-200 dark:bg-slate-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-4 rounded bg-slate-600 transition-all duration-200 dark:bg-slate-300 ${mobileOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-200/60 dark:border-slate-800/50"
            >
              <div className="flex flex-col gap-1 p-3">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Home size={15} /> Home
                </Link>
                <Link to="/queue/live" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Ticket size={15} /> Live Queue
                </Link>
                {!auth ? (
                  <>
                    <Link to="/patient/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Patient Login</Link>
                    <Link to="/doctor/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Doctor Login</Link>
                    <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Admin Login</Link>
                  </>
                ) : (
                  <>
                    <Link to={auth.user.role === 'doctor' ? '/doctor/dashboard' : auth.user.role === 'patient' ? '/patient/dashboard' : '/admin/dashboard'} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <button onClick={() => { clearAuth(); navigate('/'); setMobileOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30">
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
