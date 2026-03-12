import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Alert, Button, Card, Container, Input, Label } from '../components/ui';
import { patientLogin } from '../services/hospitalApi';
import { setAuth } from '../services/authStore';
import { motion } from 'framer-motion';
import { KeyRound, Phone, Ticket, ArrowRight, Users, Clock, Bell } from 'lucide-react';

export default function PatientLoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const patientIdFromQuery = useMemo(() => params.get('patientId') ?? '', [params]);

  const [patientId, setPatientId] = useState(patientIdFromQuery);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!patientId.trim()) return setError('Patient ID is required');
    if (!phone.trim() || phone.trim().length < 7) return setError('Enter a valid phone number');
    setLoading(true);
    try {
      const data = await patientLogin({ patientId: patientId.trim(), phone: phone.trim() });
      if (data.user.role !== 'patient') {
        setError('This account is not a patient account');
        return;
      }
      setAuth({ token: data.token, user: data.user });
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#080c14]">
      <Container className="pt-10">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Ticket size={13} /> Patient Login
              </span>
              <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">Welcome back</h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Use your Patient ID and registered phone number to continue.
              </p>
            </div>

            <Card className="shadow-sm">
              <form onSubmit={onSubmit} className="space-y-5">
                {error ? <Alert title="Login Error" message={error} /> : null}

                <div>
                  <Label className="flex items-center gap-2">
                    <KeyRound size={15} className="text-slate-400" /> Patient ID
                  </Label>
                  <Input
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="e.g. PT-XXXX-YYYY"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-400" /> Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8901"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
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
                      Sign in <ArrowRight size={15} />
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Link
                    to="/patient/register"
                    className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    New patient? Register →
                  </Link>
                  <Link
                    to="/queue/live"
                    className="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Live queue
                  </Link>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid gap-4"
          >
            {[
              {
                icon: Ticket,
                color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
                title: 'Your Token Number',
                desc: 'View your assigned token and position in queue.',
              },
              {
                icon: Users,
                color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
                title: 'Patients Ahead',
                desc: 'Know exactly how many are before you.',
              },
              {
                icon: Clock,
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                title: 'Wait Time Estimate',
                desc: 'See your estimated consultation time.',
              },
              {
                icon: Bell,
                color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
                title: 'Get Notified',
                desc: 'Receive alerts when your turn is near.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.07 }}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40"
              >
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                  <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
