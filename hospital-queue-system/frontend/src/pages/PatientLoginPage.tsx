import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Container, Input, Label } from '../components/ui';
import { patientLogin } from '../services/hospitalApi';
import { setAuth } from '../services/authStore';
import { motion } from 'framer-motion';
import { KeyRound, Phone, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <Container className="pt-8">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Patient Login</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Use your Patient ID and the phone number you registered with.
            </p>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <Ticket size={16} /> Patient ID is shown after registration
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <Phone size={16} /> Use the same phone number
            </div>
          </div>

          <Card className="mt-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {error ? <Alert title="Error" message={error} /> : null}

              <div>
                <Label className="flex items-center gap-2">
                  <KeyRound size={16} /> Patient ID
                </Label>
                <Input value={patientId} onChange={(e) => setPatientId(e.target.value)} />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Phone size={16} /> Phone
                </Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Link to="/patient/register" className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                  New patient? Register
                </Link>
                <Link to="/queue/live" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                  View live queue
                </Link>
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Why login?</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              After signing in you can track your token status and get real-time updates.
            </p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Live status</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Waiting / Called / In consultation</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Patients ahead</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Estimated waiting time</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">No password</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Secure login using Patient ID + phone</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Container>
  );
}
