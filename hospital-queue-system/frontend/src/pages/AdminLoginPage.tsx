import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Input, Label } from '../components/ui';
import { login } from '../services/hospitalApi';
import { setAuth } from '../services/authStore';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ username: username.trim(), password });
      if (data.user.role !== 'admin') {
        setError('This account is not an admin account');
        return;
      }
      setAuth({ token: data.token, user: data.user });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center bg-slate-50 dark:bg-[#080c14] overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-rose-300/20 blur-[90px] dark:bg-rose-700/12" />
        <div className="absolute -right-32 top-20 h-[350px] w-[350px] rounded-full bg-violet-300/20 blur-[80px] dark:bg-violet-700/10" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[400px] rounded-full bg-amber-300/15 blur-[80px] dark:bg-amber-700/08" />
      </div>

      <Container className="py-10">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold text-rose-700 backdrop-blur-sm dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300">
                <ShieldAlert size={13} />
                Admin Portal — Secure Access
              </div>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl shadow-rose-500/5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/60 dark:shadow-rose-900/20">
              {/* Top gradient strip — inside relative parent */}
              <div className="h-1 w-full bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500" />

              <div className="p-7">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
                    <ShieldAlert size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Admin Login</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to access the control panel</p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="mt-7 space-y-5">
                  {error ? <Alert title="Authentication Failed" message={error} /> : null}

                  <div>
                    <Label>Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="mt-2 w-full">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Signing in…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Sign in to Dashboard <ArrowRight size={15} />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
