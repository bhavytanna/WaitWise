import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { Card, Container, Select, Label, Badge, Alert } from '../components/ui';
import type { DoctorDto, QueueResponse } from '../services/hospitalApi';
import { getQueue, listDoctors } from '../services/hospitalApi';
import { getSocket } from '../services/socket';

export default function LiveQueuePage() {
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [doctorId, setDoctorId] = useState('');
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [audioEnabled, setAudioEnabled] = useState(false);
  const prevTokenRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listDoctors()
      .then((d) => {
        if (!mounted) return;
        setDoctors(d);
        setDoctorId((prev) => prev || d[0]?.id || '');
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message ?? 'Failed to load doctors');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    setError(null);
    getQueue(doctorId)
      .then(setQueue)
      .catch((e: any) => setError(e?.message ?? 'Failed to load queue'));
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId) return;
    const socket = getSocket();

    socket.emit('queue:joinDoctorRoom', doctorId);

    const onUpdate = (payload: any) => {
      if (payload?.doctor?.id === doctorId) {
        setQueue(payload as QueueResponse);
      }
    };

    const onGlobal = (payload: any) => {
      if (payload?.doctorId === doctorId && payload?.queue?.doctor?.id === doctorId) {
        setQueue(payload.queue as QueueResponse);
      }
    };

    socket.on('queue:update', onUpdate);
    socket.on('queue:updateGlobal', onGlobal);

    return () => {
      socket.off('queue:update', onUpdate);
      socket.off('queue:updateGlobal', onGlobal);
    };
  }, [doctorId]);

  const currentToken = queue?.current?.tokenNumber ?? '-';
  const nextToken = queue?.next?.tokenNumber ?? '-';
  const currentPriority = (queue as any)?.current?.priority as 'normal' | 'emergency' | undefined;
  const nextPriority = (queue as any)?.next?.priority as 'normal' | 'emergency' | undefined;

  const waitingList = useMemo(
    () => {
      const list = (queue?.queue ?? []).filter((x) => x.status === 'waiting' || x.status === 'called');
      return list.sort((a, b) => {
        const ap = a.priority === 'emergency' ? 0 : 1;
        const bp = b.priority === 'emergency' ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    },
    [queue],
  );

  useEffect(() => {
    if (!audioEnabled || !queue?.current?.tokenNumber) return;
    
    // Only speak if the token is new (not the initial load token)
    if (prevTokenRef.current && prevTokenRef.current !== queue.current.tokenNumber) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Token number ${queue.current.tokenNumber}, please proceed to doctor ${queue.doctor.name}.`;
      msg.volume = 1;
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
    
    prevTokenRef.current = queue.current.tokenNumber;
  }, [queue?.current?.tokenNumber, audioEnabled, queue?.doctor?.name]);

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Live Queue</h2>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                LIVE
              </span>
            </div>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Real-time updates as doctors call and finish consultations.</p>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 focus:ring-offset-white active:scale-95 ${
                audioEnabled
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 focus:ring-blue-500'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 focus:ring-slate-500'
              }`}
            >
              {audioEnabled ? (
                <>
                  <Volume2 size={16} /> Audio On
                </>
              ) : (
                <>
                  <VolumeX size={16} /> Enable Audio
                </>
              )}
            </button>
          </div>

          <div className="w-full sm:w-[420px]">
            {error ? <Alert title="Error" message={error} /> : null}
            <div className={error ? 'mt-3' : ''}>
              <Label>Doctor</Label>
              <Select value={doctorId} disabled={loading} onChange={(e) => setDoctorId(e.target.value)}>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Now Serving</div>
                <Activity size={18} className="text-slate-400 dark:text-slate-500" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Current</div>
                    {currentPriority === 'emergency' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                        <ShieldAlert size={14} /> EMERGENCY
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-center font-mono text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {currentToken}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Next</div>
                    {nextPriority === 'emergency' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                        <ShieldAlert size={14} /> EMERGENCY
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-center font-mono text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {nextToken}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>Queue size</span>
                <Badge>{waitingList.length}</Badge>
              </div>
            </Card>
          </motion.div>

          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Queue List</h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300">(waiting + called)</div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-4 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <div>Token</div>
                    <div>Status</div>
                    <div>Priority</div>
                    <div className="text-right">Order</div>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {waitingList.length === 0 ? (
                      <div className="px-3 py-10 text-sm text-slate-500 dark:text-slate-400">No patients waiting.</div>
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
                            <div className="font-mono text-lg font-bold text-slate-900 dark:text-slate-50">{item.tokenNumber}</div>
                            <div>
                              <Badge>{item.status}</Badge>
                            </div>
                            <div>
                              {item.priority === 'emergency' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                                  <ShieldAlert size={14} /> EMERGENCY
                                </span>
                              ) : (
                                <Badge>normal</Badge>
                              )}
                            </div>
                            <div className="text-right text-slate-600 dark:text-slate-300">#{idx + 1}</div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Container>
  );
}
