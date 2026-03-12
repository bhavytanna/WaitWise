import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, SectionHeader } from '../components/ui';
import { getAuth, clearAuth } from '../services/authStore';
import type { QueueResponse } from '../services/hospitalApi';
import { callPatient, doctorSetPatientPriority, getQueue, nextPatient } from '../services/hospitalApi';
import { getSocket } from '../services/socket';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, LogOut, PhoneCall, ShieldAlert, SkipForward, Users, Activity, Clock } from 'lucide-react';

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  const [auth] = useState(() => getAuth());
  const doctorId = auth?.user.doctorId;

  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || auth.user.role !== 'doctor' || !doctorId) { navigate('/doctor/login'); return; }
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
      if (payload?.doctor?.id === doctorId) setQueue(payload as QueueResponse);
    };
    socket.on('queue:update', onUpdate);
    return () => { socket.off('queue:update', onUpdate); };
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
    setError(null); setActionLoading(true);
    try { await doctorSetPatientPriority(patientId, 'emergency'); }
    catch (e: any) { setError(e?.message ?? 'Failed to mark emergency'); }
    finally { setActionLoading(false); }
  }

  async function doCall() {
    if (!doctorId) return;
    setError(null); setActionLoading(true);
    try {
      const data = await callPatient(doctorId);
      setQueue(data);
      if (data?.current?.tokenNumber) {
        const msg = new SpeechSynthesisUtterance();
        msg.text = `Token number ${data.current.tokenNumber}, please proceed.`;
        msg.volume = 1; msg.rate = 0.9; msg.pitch = 1;
        window.speechSynthesis.speak(msg);
      }
    } catch (e: any) { setError(e?.message ?? 'Failed to call patient'); }
    finally { setActionLoading(false); }
  }

  async function doNext() {
    if (!doctorId) return;
    setError(null); setActionLoading(true);
    try { const data = await nextPatient(doctorId); setQueue(data); }
    catch (e: any) { setError(e?.message ?? 'Failed to move to next patient'); }
    finally { setActionLoading(false); }
  }

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Doctor Dashboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {queue?.doctor.name ? `${queue.doctor.name} · ${queue.doctor.department}` : 'Manage your queue'}
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => { clearAuth(); navigate('/doctor/login'); }}>
            <LogOut size={15} /> Logout
          </Button>
        </div>

        {error && <div className="mt-4"><Alert title="Error" message={error} /></div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Control Panel */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
            <Card>
              <SectionHeader title="Queue Control" subtitle="Call or advance to next patient" icon={<Users size={16} />} />

              {/* Current Token Display */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-center dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-blue-950/20">
                <div className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Now Serving</div>
                <div className="mt-1 font-mono text-5xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300">
                  {queue?.current?.tokenNumber ?? '-'}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Status:</span>
                  <Badge>{queue?.current?.status ?? 'none'}</Badge>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/80 px-4 py-2.5 dark:border-slate-800/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Clock size={14} /> Next token
                </div>
                <Badge className="font-mono text-sm">{nextToken}</Badge>
              </div>

              <div className="mt-4 grid gap-3">
                <Button
                  variant="secondary"
                  disabled={actionLoading || loading}
                  onClick={doCall}
                  className="w-full justify-center"
                >
                  <PhoneCall size={16} />
                  {actionLoading ? 'Please wait…' : 'CALL Patient'}
                </Button>
                <Button
                  disabled={actionLoading || loading}
                  onClick={doNext}
                  className="w-full justify-center"
                >
                  <SkipForward size={16} />
                  {actionLoading ? 'Please wait…' : 'NEXT Patient'}
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200/50 bg-slate-50/60 p-3 text-xs text-slate-500 dark:border-slate-800/40 dark:bg-slate-900/30 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">CALL</span> marks next as called. <span className="font-semibold text-slate-700 dark:text-slate-300">NEXT</span> finishes current and advances.
              </div>
            </Card>
          </motion.div>

          {/* Queue List */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.13 }}>
            <Card>
              <div className="flex items-center justify-between">
                <SectionHeader title="Patient Queue" subtitle="Sorted by priority, then arrival time" icon={<Users size={16} />} />
                <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  {waitingList.length} waiting
                </Badge>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50">
                <div className="table-header grid-cols-4">
                  <div>Token</div>
                  <div>Status</div>
                  <div>Position</div>
                  <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                  {waitingList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                        <Users size={22} />
                      </div>
                      <div className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No patients waiting</div>
                    </div>
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
                          className={`table-row grid-cols-4 ${item.priority === 'emergency' ? 'bg-rose-50/60 dark:bg-rose-950/15' : 'bg-white dark:bg-slate-900/30'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-50">{item.tokenNumber}</span>
                            {item.priority === 'emergency' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                                <ShieldAlert size={11} /> EMRG
                              </span>
                            )}
                          </div>
                          <div>
                            <Badge className={item.status === 'called' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : ''}>{item.status}</Badge>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">#{idx + 1}</div>
                          <div className="flex justify-end">
                            {item.priority !== 'emergency' && item.status === 'waiting' ? (
                              <button
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-rose-800/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                                disabled={actionLoading}
                                onClick={() => void markEmergency(item.patientId)}
                              >
                                <AlertTriangle size={13} /> Emergency
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
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
