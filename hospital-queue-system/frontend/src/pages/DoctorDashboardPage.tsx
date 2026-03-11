import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container } from '../components/ui';
import { getAuth, clearAuth } from '../services/authStore';
import type { QueueResponse } from '../services/hospitalApi';
import { callPatient, doctorSetPatientPriority, getQueue, nextPatient } from '../services/hospitalApi';
import { getSocket } from '../services/socket';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, LogOut, PhoneCall, ShieldAlert, SkipForward, Users } from 'lucide-react';

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  const [auth] = useState(() => getAuth());
  const doctorId = auth?.user.doctorId;

  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || auth.user.role !== 'doctor' || !doctorId) {
      navigate('/doctor/login');
      return;
    }

    setLoading(true);
    getQueue(doctorId)
      .then(setQueue)
      .catch((e: any) => setError(e?.message ?? 'Failed to load queue'))
      .finally(() => setLoading(false));
  }, [auth, doctorId, navigate]);

  useEffect(() => {
    if (!doctorId) return;
    const socket = getSocket();
    socket.emit('queue:joinDoctorRoom', doctorId);

    const onUpdate = (payload: any) => {
      if (payload?.doctor?.id === doctorId) {
        setQueue(payload as QueueResponse);
      }
    };

    socket.on('queue:update', onUpdate);
    return () => {
      socket.off('queue:update', onUpdate);
    };
  }, [doctorId]);

  const waitingList = useMemo(() => {
    const list = (queue?.queue ?? []).filter((x) => x.status === 'waiting' || x.status === 'called');
    return list.sort((a, b) => {
      const ap = a.priority === 'emergency' ? 0 : 1;
      const bp = b.priority === 'emergency' ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [queue]);

  const nextToken = waitingList[0]?.tokenNumber ?? '-';

  async function markEmergency(patientId: string) {
    setError(null);
    setActionLoading(true);
    try {
      await doctorSetPatientPriority(patientId, 'emergency');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to mark emergency');
    } finally {
      setActionLoading(false);
    }
  }

  async function doCall() {
    if (!doctorId) return;
    setError(null);
    setActionLoading(true);
    try {
      const data = await callPatient(doctorId);
      setQueue(data);
      
      // Auto-announce in the doctor dashboard so they know it worked
      if (data?.current?.tokenNumber) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `Token number ${data.current.tokenNumber}, please proceed.`;
        msg.volume = 1;
        msg.rate = 0.9;
        msg.pitch = 1;
        window.speechSynthesis.speak(msg);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to call patient');
    } finally {
      setActionLoading(false);
    }
  }

  async function doNext() {
    if (!doctorId) return;
    setError(null);
    setActionLoading(true);
    try {
      const data = await nextPatient(doctorId);
      setQueue(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to move to next patient');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Doctor Dashboard</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {queue?.doctor.name ? `${queue.doctor.name} • ${queue.doctor.department}` : 'Manage your queue'}
            </p>
          </div>
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => {
              clearAuth();
              navigate('/doctor/login');
            }}
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert title="Error" message={error} />
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Current</div>
                <Users size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {queue?.current?.tokenNumber ?? '-'}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Status</span>
                <Badge>{queue?.current?.status ?? 'none'}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Next token</span>
                <Badge>{nextToken}</Badge>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button disabled={actionLoading || loading} onClick={doCall} variant="secondary">
                  <PhoneCall size={16} /> {actionLoading ? 'Please wait…' : 'CALL'}
                </Button>
                <Button disabled={actionLoading || loading} onClick={doNext}>
                  <SkipForward size={16} /> {actionLoading ? 'Please wait…' : 'NEXT'}
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-3 text-xs text-slate-600 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                Tip: CALL marks the next waiting token as called. NEXT finishes current and starts the next.
              </div>
            </Card>
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Queue</h3>
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Waiting: <Badge>{waitingList.length}</Badge>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-4 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                  <div>Token</div>
                  <div>Status</div>
                  <div>Order</div>
                  <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {waitingList.length === 0 ? (
                    <div className="px-3 py-6 text-sm text-slate-500 dark:text-slate-400">No patients waiting.</div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {waitingList.map((item, idx) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className={`grid grid-cols-4 items-center gap-2 px-3 py-2 text-sm ${
                            item.priority === 'emergency'
                              ? 'bg-rose-50 dark:bg-rose-950/20'
                              : 'bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-50">
                            {item.tokenNumber}
                            {item.priority === 'emergency' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                                <ShieldAlert size={14} /> EMERGENCY
                              </span>
                            ) : null}
                          </div>
                          <div>
                            <Badge>{item.status}</Badge>
                          </div>
                          <div className="text-slate-600 dark:text-slate-300">#{idx + 1}</div>
                          <div className="flex justify-end">
                            {item.priority !== 'emergency' && item.status === 'waiting' ? (
                              <button
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                                disabled={actionLoading}
                                onClick={() => void markEmergency(item.patientId)}
                              >
                                <AlertTriangle size={14} /> Mark emergency
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
}
