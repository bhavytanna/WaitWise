import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Input, Label } from '../components/ui';
import { login } from '../services/hospitalApi';
import { setAuth } from '../services/authStore';
import { motion } from 'framer-motion';
import { LockKeyhole, ShieldAlert, UserRound } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Container className="pt-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-500/10" />
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-violet-200/70 blur-3xl dark:bg-violet-500/10" />
          <div className="absolute -bottom-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-500/10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative mx-auto max-w-md"
        >
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <ShieldAlert size={14} className="text-rose-500" />
                  Admin Portal
                </div>
                <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-50">Admin Login</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in with your admin account.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                <LockKeyhole size={18} className="text-slate-700 dark:text-slate-200" />
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {error ? <Alert title="Error" message={error} /> : null}
              <div>
                <Label>Username</Label>
                <div className="relative">
                  <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-9" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input className="pl-9" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
