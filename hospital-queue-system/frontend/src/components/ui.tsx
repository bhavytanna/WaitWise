import type React from 'react';
import type { PropsWithChildren } from 'react';

export function Container({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={`mx-auto w-full max-w-5xl px-4 py-10 ${className ?? ''}`}>{children}</div>;
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900/60 dark:ring-slate-800/50 dark:hover:shadow-slate-900/50 ${
        className ?? ''
      }`}
    >
      {children}
    </div>
  );
}

export function Label({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={`text-sm font-medium text-slate-700 dark:text-slate-200 ${className ?? ''}`}>{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-900 ${
        props.className ?? ''
      }`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-900 ${
        props.className ?? ''
      }`}
    />
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' },
) {
  const variant = props.variant ?? 'primary';
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-slate-950 focus:ring-offset-white';
  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 shadow-blue-500/25 dark:from-blue-600 dark:to-blue-500 dark:shadow-blue-500/20'
      : variant === 'danger'
        ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 focus:ring-rose-500 shadow-rose-500/25 dark:from-rose-600 dark:to-rose-500 dark:shadow-rose-500/20'
        : 'bg-white text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 dark:hover:bg-slate-800 dark:focus:ring-slate-700';

  return (
    <button
      {...props}
      className={`${base} ${styles} ${props.className ?? ''}`}
    />
  );
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100 ${
        className ?? ''
      }`}
    >
      {children}
    </span>
  );
}

export function Alert({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-rose-900/90 dark:text-rose-200/90">{message}</div>
    </div>
  );
}
