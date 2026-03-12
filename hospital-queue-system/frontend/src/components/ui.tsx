import type React from 'react';
import type { PropsWithChildren } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-4 py-10 ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export function Label({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`input-field ${className ?? ''}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={`input-field appearance-none cursor-pointer ${className ?? ''}`}
    />
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' },
) {
  const { variant = 'primary', className, ...rest } = props;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none dark:focus:ring-offset-slate-950';

  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 focus:ring-indigo-500 dark:from-blue-500 dark:to-indigo-500',
    danger:
      'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.45)] hover:-translate-y-0.5 focus:ring-rose-500',
    secondary:
      'border border-slate-200/80 bg-white/80 text-slate-700 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow-md focus:ring-slate-300 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-600 dark:focus:ring-slate-600',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
  };

  return (
    <button {...rest} className={`${base} ${variants[variant]} ${className ?? ''}`} />
  );
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200 ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

export function Alert({
  title,
  message,
  variant = 'error',
}: {
  title: string;
  message: string;
  variant?: 'error' | 'success' | 'info';
}) {
  const styles = {
    error: {
      wrapper: 'border-rose-200/80 bg-rose-50/80 dark:border-rose-900/40 dark:bg-rose-950/30',
      icon: <AlertCircle size={16} className="text-rose-500 dark:text-rose-400 shrink-0" />,
      title: 'text-rose-800 dark:text-rose-300',
      msg: 'text-rose-700/90 dark:text-rose-400/90',
    },
    success: {
      wrapper: 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/30',
      icon: <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />,
      title: 'text-emerald-800 dark:text-emerald-300',
      msg: 'text-emerald-700/90 dark:text-emerald-400/90',
    },
    info: {
      wrapper: 'border-blue-200/80 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/30',
      icon: <Info size={16} className="text-blue-500 dark:text-blue-400 shrink-0" />,
      title: 'text-blue-800 dark:text-blue-300',
      msg: 'text-blue-700/90 dark:text-blue-400/90',
    },
  };
  const s = styles[variant];
  return (
    <div className={`flex gap-3 rounded-xl border p-3.5 backdrop-blur-sm ${s.wrapper}`}>
      <div className="mt-0.5">{s.icon}</div>
      <div>
        <div className={`text-sm font-semibold ${s.title}`}>{title}</div>
        <div className={`mt-0.5 text-sm ${s.msg}`}>{message}</div>
      </div>
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-current"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          {icon}
        </div>
      )}
    </div>
  );
}
