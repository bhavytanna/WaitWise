import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Card, Container, Button, SectionHeader } from '../components/ui';
import { clearAuth, getAuth } from '../services/authStore';
import type { PatientStatusResponse } from '../services/hospitalApi';
import { getMyPatientStatus } from '../services/hospitalApi';
import { getSocket } from '../services/socket';
import { motion } from 'framer-motion';
import { Activity, Bell, CheckCircle2, Clock, LogOut, RefreshCw, ShieldAlert, Stethoscope, Ticket, Users } from 'lucide-react';

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

  const statusConfig = useMemo(() => {
    if (patientStatus === 'done') return { label: 'Done', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', step: 2 };
    if (patientStatus === 'in_consultation') return { label: 'In Consultation', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300', step: 1 };
    if (patientStatus === 'called') return { label: 'Called', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300', step: 0 };
    return { label: patientStatus ?? 'Waiting', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', step: 0 };
  }, [patientStatus]);

  async function refresh() {
    if (!auth?.token) return;
    setError(null); setLoading(true);
    try { setData(await getMyPatientStatus()); }
    catch (e: any) { setError(e?.message ?? 'Failed to load status'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!auth || auth.user.role !== 'patient') { navigate('/patient/login'); return; }
    void refresh();
  }, [auth, navigate]);

  useEffect(() => {
    if (!doctorId) return;
    const socket = getSocket();
    const onGlobal = (payload: any) => { if (payload?.doctorId === doctorId) void refresh(); };
    const onUpdate = (payload: any) => { if (payload?.doctor?.id === doctorId) void refresh(); };
    socket.on('queue:updateGlobal', onGlobal);
    socket.on('queue:update', onUpdate);
    return () => { socket.off('queue:updateGlobal', onGlobal); socket.off('queue:update', onUpdate); };
  }, [doctorId]);

  useEffect(() => {
    const patientId = data?.patient?.id;
    const tokenNumber = data?.patient?.tokenNumber;
    const status = data?.patient?.status;
    const minutes = data?.estimatedWaitTimeMinutes;
    if (!patientId || !tokenNumber) return;
    if (status !== 'waiting') { setTenMinNotice(null); return; }
    if (typeof minutes !== 'number' || minutes > 10) { setTenMinNotice(null); return; }
    const key = `notify10:${patientId}:${tokenNumber}`;
    const already = localStorage.getItem(key) === '1';
    const message = `Your turn is coming soon! Estimated wait: ${Math.max(0, Math.round(minutes))} min.`;
    setTenMinNotice(message);
    if (already) return;
    localStorage.setItem(key, '1');
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('WaitWise Update', { body: message });
      }
    } catch { /* ignore */ }
  }, [data]);

  async function enableNotifications() {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch { /* ignore */ }
  }

  const steps = [
    { label: 'Waiting', key: 'waiting' },
    { label: 'In Consultation', key: 'in_consultation' },
    { label: 'Done', key: 'done' },
  ];
  const currentStepIdx = steps.findIndex((s) => s.key === patientStatus);

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
              <Ticket size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Patient Dashboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Track your token and wait time in real time</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button variant="secondary" onClick={() => { clearAuth(); navigate('/'); }}>
              <LogOut size={15} /> Logout
            </Button>
          </div>
        </div>

        {error && <div className="mt-4"><Alert title="Error" message={error} /></div>}
        {tenMinNotice && (
          <div className="mt-4">
            <Alert title="Almost Your Turn! 🔔" message={tenMinNotice} variant="info" />
          </div>
        )}

        {/* Status Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="mt-5 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Activity size={16} className="text-indigo-500" /> Journey Status
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.cls}>{statusConfig.label}</Badge>
              {patientPriority === 'emergency' && (
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  <ShieldAlert size={11} /> EMERGENCY
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {steps.map((s, idx) => {
              const done = currentStepIdx >= idx;
              const active = currentStepIdx === idx;
              return (
                <div
                  key={s.key}
                  className={`relative rounded-xl border p-3 transition-all duration-300 ${
                    done
                      ? 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-slate-200/60 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/30'
                  } ${active ? 'ring-2 ring-indigo-300/60 dark:ring-indigo-700/40' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {done ? <CheckCircle2 size={12} /> : idx + 1}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Token Card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}>
            <Card>
              <SectionHeader title="Your Token" icon={<Ticket size={16} />} />

              {/* Big token */}
              <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 text-center dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-blue-950/20">
                <div className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Token Number</div>
                <div className="mt-1 font-mono text-5xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300">
                  {data?.patient?.tokenNumber ?? '—'}
                </div>
              </div>

              {'Notification' in window && Notification.permission !== 'granted' && (
                <div className="mt-3">
                  <Button variant="secondary" onClick={enableNotifications} className="w-full text-xs">
                    <Bell size={14} /> Enable Notifications
                  </Button>
                </div>
              )}

              <div className="mt-4 grid gap-2">
                {[
                  { label: 'Status', value: data?.patient?.status ?? '—', cls: statusConfig.cls },
                  { label: 'Patients Ahead', value: String(data?.patientsAhead ?? '—'), cls: '' },
                  { label: 'Est. Wait', value: typeof data?.estimatedWaitTimeMinutes === 'number' ? `${data.estimatedWaitTimeMinutes} min` : '—', cls: '' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800/50 dark:bg-slate-900/30">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                    <Badge className={item.cls || undefined}>{item.value}</Badge>
                  </div>
                ))}
              </div>

              {loading && <div className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">Refreshing…</div>}
            </Card>
          </motion.div>

          {/* Doctor Info Card */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.17 }}>
            <Card>
              <div className="flex items-center justify-between gap-3">
                <SectionHeader title="Your Doctor" icon={<Stethoscope size={16} />} />
                <Button variant="secondary" onClick={() => navigate('/queue/live')} className="text-xs">
                  Live Queue →
                </Button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Name', value: data?.doctor?.name ?? '—', icon: Users },
                  { label: 'Department', value: data?.doctor?.department ?? '—', icon: Activity },
                  { label: 'Avg Consult Time', value: typeof data?.doctor?.avgConsultTime === 'number' ? `${data.doctor.avgConsultTime} min` : '—', icon: Clock },
                  { label: 'Arrival Time', value: data?.patient?.arrivalTime ? new Date(data.patient.arrivalTime).toLocaleString() : '—', icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200/60 bg-white/70 p-3.5 dark:border-slate-800/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                      <item.icon size={12} /> {item.label}
                    </div>
                    <div className="mt-1.5 font-semibold text-slate-900 dark:text-slate-50">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-4 rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Tips</div>
                <ul className="grid gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <li>• Stay nearby when your token is close to being called</li>
                  <li>• Enable notifications to get alerts when it's nearly your turn</li>
                  <li>• Check the Live Queue board for real-time updates</li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
