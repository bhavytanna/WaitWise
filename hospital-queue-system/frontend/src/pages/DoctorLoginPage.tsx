import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Container, Input, Label } from '../components/ui';
import { login } from '../services/hospitalApi';
import { setAuth } from '../services/authStore';
import { motion } from 'framer-motion';
import { Stethoscope, ArrowRight } from 'lucide-react';

export default function DoctorLoginPage() {
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
      if (data.user.role !== 'doctor') {
        setError('This account is not a doctor account');
        return;
      }
      setAuth({ token: data.token, user: data.user });
      navigate('/doctor/dashboard');
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
        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-blue-300/20 blur-[90px] dark:bg-blue-700/12" />
        <div className="absolute -right-32 top-20 h-[350px] w-[350px] rounded-full bg-cyan-300/18 blur-[80px] dark:bg-cyan-700/10" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[400px] rounded-full bg-indigo-300/15 blur-[80px] dark:bg-indigo-700/08" />
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
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-sm dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300">
                <Stethoscope size={13} />
                Doctor Portal — Secure Login
              </div>
            </div>

            {/* Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl shadow-blue-500/5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-900/60 dark:shadow-blue-900/20">
              {/* Top gradient strip — inside relative parent */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-400" />

              <div className="p-7">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <Stethoscope size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Doctor Login</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your patient queue</p>
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
                      placeholder="johndoe"
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
