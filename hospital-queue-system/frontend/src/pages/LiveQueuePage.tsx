import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ShieldAlert, Volume2, VolumeX, Users, Wifi, Stethoscope } from 'lucide-react';
import { Card, Container, Select, Label, Badge, Alert, SectionHeader } from '../components/ui';
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
      .catch((e: any) => { if (!mounted) return; setError(e?.message ?? 'Failed to load doctors'); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
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
    const onUpdate = (payload: any) => { if (payload?.doctor?.id === doctorId) setQueue(payload as QueueResponse); };
    const onGlobal = (payload: any) => { if (payload?.doctorId === doctorId && payload?.queue?.doctor?.id === doctorId) setQueue(payload.queue as QueueResponse); };
    socket.on('queue:update', onUpdate);
    socket.on('queue:updateGlobal', onGlobal);
    return () => { socket.off('queue:update', onUpdate); socket.off('queue:updateGlobal', onGlobal); };
  }, [doctorId]);

  const currentToken = queue?.current?.tokenNumber ?? '—';
  const nextToken = queue?.next?.tokenNumber ?? '—';
  const currentPriority = (queue as any)?.current?.priority as 'normal' | 'emergency' | undefined;
  const nextPriority = (queue as any)?.next?.priority as 'normal' | 'emergency' | undefined;

  const waitingList = useMemo(() => {
    const list = (queue?.queue ?? []).filter((x) => x.status === 'waiting' || x.status === 'called');
    return list.sort((a, b) => {
      const ap = a.priority === 'emergency' ? 0 : 1;
      const bp = b.priority === 'emergency' ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [queue]);

  useEffect(() => {
    if (!audioEnabled || !queue?.current?.tokenNumber) return;
    if (prevTokenRef.current && prevTokenRef.current !== queue.current.tokenNumber) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Token number ${queue.current.tokenNumber}, please proceed to doctor ${queue.doctor.name}.`;
      msg.volume = 1; msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
    prevTokenRef.current = queue.current.tokenNumber;
  }, [queue?.current?.tokenNumber, audioEnabled, queue?.doctor?.name]);

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25">
                <Activity size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Live Queue</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    LIVE
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Real-time updates as doctors call patients.</p>
              </div>
            </div>

            {/* Audio toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${
                audioEnabled
                  ? 'border-indigo-200/80 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300'
                  : 'border-slate-200/80 bg-white/80 text-slate-600 hover:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300'
              }`}
            >
              {audioEnabled ? <><Volume2 size={15} /> Audio On</> : <><VolumeX size={15} /> Enable Audio</>}
            </button>
          </div>

          {/* Doctor selector */}
          <div className="w-full sm:w-80">
            {error ? <Alert title="Error" message={error} /> : null}
            <div className={error ? 'mt-3' : ''}>
              <Label className="flex items-center gap-1.5"><Stethoscope size={14} className="text-slate-400" /> Select Doctor</Label>
              <Select value={doctorId} disabled={loading} onChange={(e) => setDoctorId(e.target.value)}>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Now Serving */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
            <Card>
              <SectionHeader title="Now Serving" icon={<Wifi size={16} className="text-emerald-500" />} />

              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Current */}
                <div className={`overflow-hidden rounded-2xl border p-4 text-center transition-all ${
                  currentPriority === 'emergency'
                    ? 'border-rose-200/80 bg-rose-50/80 dark:border-rose-800/50 dark:bg-rose-950/20'
                    : 'border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-blue-950/20'
                }`}>
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Current</div>
                    {currentPriority === 'emergency' && <ShieldAlert size={12} className="text-rose-500" />}
                  </div>
                  <div className={`mt-2 font-mono text-4xl font-extrabold tracking-tight ${
                    currentPriority === 'emergency'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {currentToken}
                  </div>
                  {currentPriority === 'emergency' && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                      <ShieldAlert size={10} /> EMERGENCY
                    </div>
                  )}
                </div>

                {/* Next */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 text-center dark:border-slate-800/50 dark:bg-slate-900/40">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Next Up</div>
                  <div className={`mt-2 font-mono text-4xl font-extrabold tracking-tight ${
                    nextPriority === 'emergency'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {nextToken}
                  </div>
                  {nextPriority === 'emergency' && (
                    <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                      <ShieldAlert size={10} /> EMERGENCY
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-2.5 dark:border-slate-800/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Users size={14} /> Queue size
                </div>
                <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-mono">{waitingList.length}</Badge>
              </div>
            </Card>
          </motion.div>

          {/* Queue List */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.13 }}>
              <Card>
                <SectionHeader title="Queue List" subtitle="Waiting and called patients" icon={<Users size={16} />} />

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50">
                  <div className="table-header grid-cols-4">
                    <div>Token</div>
                    <div>Status</div>
                    <div>Priority</div>
                    <div className="text-right">Position</div>
                  </div>
                  <div className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                    {waitingList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                          <Users size={26} />
                        </div>
                        <div className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">No patients waiting</div>
                        <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">Queue is empty for this doctor</div>
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
                            className={`table-row grid-cols-4 ${
                              item.priority === 'emergency' ? 'bg-rose-50/60 dark:bg-rose-950/15' : 'bg-white dark:bg-slate-900/30'
                            }`}
                          >
                            <div className="font-mono text-lg font-bold text-slate-900 dark:text-slate-50">{item.tokenNumber}</div>
                            <div>
                              <Badge className={item.status === 'called' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : ''}>
                                {item.status}
                              </Badge>
                            </div>
                            <div>
                              {item.priority === 'emergency' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                                  <ShieldAlert size={11} /> EMERGENCY
                                </span>
                              ) : (
                                <Badge>normal</Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className="font-mono">#{idx + 1}</Badge>
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
        </div>
      </motion.div>
    </Container>
  );
}
