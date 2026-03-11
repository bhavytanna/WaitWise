import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Card, Container, Button } from '../components/ui';
import { clearAuth, getAuth } from '../services/authStore';
import type { PatientStatusResponse } from '../services/hospitalApi';
import { getMyPatientStatus } from '../services/hospitalApi';
import { getSocket } from '../services/socket';
import { motion } from 'framer-motion';
import { Activity, Clock, LogOut, RefreshCw, Stethoscope, Ticket } from 'lucide-react';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const [auth] = useState(() => getAuth());

  const [data, setData] = useState<PatientStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenMinNotice, setTenMinNotice] = useState<string | null>(null);

  const doctorId = useMemo(() => data?.doctor?.id ?? null, [data]);

  const patientStatus = data?.patient?.status ?? null;
  const patientPriority = data?.patient?.priority ?? 'normal';

  const statusSteps = useMemo(
    () => [
      { key: 'waiting' as const, label: 'Waiting' },
      { key: 'in_consultation' as const, label: 'In consultation' },
      { key: 'done' as const, label: 'Done' },
    ],
    [],
  );

  const currentStepIndex = useMemo(() => {
    if (!patientStatus) return -1;
    const idx = statusSteps.findIndex((s) => s.key === patientStatus);
    return idx;
  }, [patientStatus, statusSteps]);

  const statusBadgeClass = useMemo(() => {
    if (!patientStatus) return '';
    if (patientStatus === 'done') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200';
    if (patientStatus === 'in_consultation') return 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200';
    return 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
  }, [patientStatus]);

  async function refresh() {
    if (!auth?.token) return;
    setError(null);
    setLoading(true);
    try {
      setData(await getMyPatientStatus());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load status');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth || auth.user.role !== 'patient') {
      navigate('/patient/login');
      return;
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, navigate]);

  useEffect(() => {
    if (!doctorId) return;
    const socket = getSocket();

    const onGlobal = (payload: any) => {
      if (payload?.doctorId === doctorId) {
        void refresh();
      }
    };

    const onUpdate = (payload: any) => {
      if (payload?.doctor?.id === doctorId) {
        void refresh();
      }
    };

    socket.on('queue:updateGlobal', onGlobal);
    socket.on('queue:update', onUpdate);

    return () => {
      socket.off('queue:updateGlobal', onGlobal);
      socket.off('queue:update', onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  useEffect(() => {
    const patientId = data?.patient?.id;
    const tokenNumber = data?.patient?.tokenNumber;
    const status = data?.patient?.status;
    const minutes = data?.estimatedWaitTimeMinutes;

    if (!patientId || !tokenNumber) return;
    if (status !== 'waiting') {
      setTenMinNotice(null);
      return;
    }
    if (typeof minutes !== 'number') return;
    if (minutes > 10) {
      setTenMinNotice(null);
      return;
    }

    const key = `notify10:${patientId}:${tokenNumber}`;
    const already = localStorage.getItem(key) === '1';
    const message = `Your turn is coming soon. Estimated wait: ${Math.max(0, Math.round(minutes))} min.`;

    setTenMinNotice(message);

    if (already) return;
    localStorage.setItem(key, '1');

    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('WaitWise Update', {
            body: message,
          });
        }
      }
    } catch {
      // ignore
    }
  }, [data]);

  async function enableNotifications() {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
    } catch {
      // ignore
    }
  }

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Patient Dashboard</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Track your token status and estimated waiting time.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearAuth();
                navigate('/');
              }}
            >
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert title="Error" message={error} />
          </div>
        ) : null}

        {tenMinNotice ? (
          <div className="mt-4">
            <Alert title="Almost your turn" message={tenMinNotice} />
          </div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Activity size={16} /> Status timeline
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={statusBadgeClass}>{patientStatus ?? '-'}</Badge>
              {patientPriority === 'emergency' ? (
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">EMERGENCY</Badge>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {statusSteps.map((s, idx) => {
              const done = currentStepIndex >= idx;
              const active = currentStepIndex === idx;
              return (
                <div
                  key={s.key}
                  className={`rounded-2xl border p-3 transition ${
                    done
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/25'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                  } ${active ? 'ring-2 ring-blue-200 dark:ring-blue-900' : ''}`}
                >
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Step {idx + 1}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your Token</div>
                <Ticket size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {data?.patient?.tokenNumber ?? '-'}
              </div>

              {'Notification' in window && Notification.permission !== 'granted' ? (
                <div className="mt-3">
                  <Button variant="secondary" onClick={enableNotifications}>
                    Enable notifications
                  </Button>
                </div>
              ) : null}

              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Status</span>
                  <Badge className={statusBadgeClass}>{data?.patient?.status ?? '-'}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Patients ahead</span>
                  <Badge>{data?.patientsAhead ?? '-'}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} /> Est. wait
                  </span>
                  <Badge>{typeof data?.estimatedWaitTimeMinutes === 'number' ? `${data.estimatedWaitTimeMinutes} min` : '-'}</Badge>
                </div>
              </div>

              {loading ? <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading…</div> : null}
            </Card>
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-slate-400 dark:text-slate-500" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Doctor</h3>
                </div>
                <Button variant="secondary" onClick={() => navigate('/queue/live')} disabled={loading}>
                  View Live Queue
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Name</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{data?.doctor?.name ?? '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Department</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{data?.doctor?.department ?? '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg consult time</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {typeof data?.doctor?.avgConsultTime === 'number' ? `${data?.doctor?.avgConsultTime} min` : '-'}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Arrival time</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {data?.patient?.arrivalTime ? new Date(data.patient.arrivalTime).toLocaleString() : '-'}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
