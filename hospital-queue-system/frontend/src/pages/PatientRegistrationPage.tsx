import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Input, Label, Select, Button, Alert, Badge } from '../components/ui';
import type { DoctorDto, RegisterPatientResult } from '../services/hospitalApi';
import { listDoctors, registerPatient } from '../services/hospitalApi';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardCopy, Phone, Stethoscope, User, ClipboardList, ArrowRight, Clock, Users } from 'lucide-react';

type FormState = { name: string; age: string; phone: string; doctorId: string };

export default function PatientRegistrationPage() {
  const [doctors, setDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterPatientResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormState>({ name: '', age: '', phone: '', doctorId: '' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listDoctors()
      .then((d) => {
        if (!mounted) return;
        if (d.length === 0) setError('No doctors available. Add doctors as admin.');
        setDoctors(d);
        setForm((f) => ({ ...f, doctorId: f.doctorId || (d[0]?.id ?? '') }));
      })
      .catch((e: any) => { if (!mounted) return; setError(e?.message ?? 'Failed to load doctors'); })
      .finally(() => { if (!mounted) return; setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === form.doctorId) ?? null, [doctors, form.doctorId]);

  useEffect(() => {
    if (form.doctorId || doctors.length === 0) return;
    setForm((f) => ({ ...f, doctorId: doctors[0]!.id }));
  }, [doctors, form.doctorId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const ageNum = Number(form.age);
    if (!form.name.trim()) return setError('Name is required');
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) return setError('Enter valid age (0–120)');
    if (!form.phone.trim() || form.phone.trim().length < 7) return setError('Enter valid phone number');
    if (!form.doctorId) return setError('Select a doctor');
    setSubmitting(true);
    try {
      const data = await registerPatient({ name: form.name.trim(), age: ageNum, phone: form.phone.trim(), doctorId: form.doctorId });
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyPatientId() {
    if (!result?.patientId) return;
    try {
      await navigator.clipboard.writeText(result.patientId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { setCopied(false); }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-[#080c14]">
      <Container className="pt-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <ClipboardList size={13} /> New Registration
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-50">Patient Registration</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get your token and track real-time status.</p>
              </div>
              <Link to="/queue/live" className="shrink-0 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-600">
                Live Queue →
              </Link>
            </div>

            {/* Steps */}
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-4 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/40">
              {['Fill details', 'Pick doctor', 'Get token'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{s}</span>
                  {i < 2 && <span className="text-slate-300 dark:text-slate-600">·</span>}
                </div>
              ))}
            </div>

            <Card>
              <form onSubmit={onSubmit} className="space-y-5">
                {error ? <Alert title="Registration Error" message={error} /> : null}

                <div>
                  <Label className="flex items-center gap-2"><User size={14} className="text-slate-400" /> Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Age</Label>
                    <Input inputMode="numeric" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} placeholder="e.g. 28" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> Phone</Label>
                    <Input inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 8901" />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2"><Stethoscope size={14} className="text-slate-400" /> Doctor</Label>
                  <Select disabled={loading} value={form.doctorId} onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}>
                    <option value="" disabled>Select a doctor…</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.department})</option>
                    ))}
                  </Select>
                  {selectedDoctor && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={12} /> Avg consult: <Badge className="text-xs">{selectedDoctor.avgConsultTime} min</Badge>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={submitting || loading || doctors.length === 0} className="w-full">
                  {loading ? 'Loading doctors…' : submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Registering…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">Register & Get Token <ArrowRight size={15} /></span>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Right: Result or placeholder */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="h-full">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
                  <ClipboardList size={17} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-50">Your Token</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Appears here after registration</p>
                </div>
              </div>

              {result ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {/* Success banner */}
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Registration Successful!</div>
                  </div>

                  {/* Token highlight */}
                  <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 text-center dark:border-indigo-800/40 dark:from-indigo-950/30 dark:to-blue-950/20">
                    <div className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Token Number</div>
                    <div className="mt-1 font-mono text-5xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300">{result.tokenNumber}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Dr. {result.doctorName}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800/50 dark:bg-slate-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400"><Users size={12} /> Patients Ahead</div>
                      <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">{result.patientsAhead}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200/60 bg-white/70 p-3 dark:border-slate-800/50 dark:bg-slate-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400"><Clock size={12} /> Estimated Wait</div>
                      <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">{result.estimatedWaitTimeMinutes} min</div>
                    </div>
                  </div>

                  {/* Patient ID copy */}
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50">
                    <div className="flex items-center justify-between gap-3 bg-white/70 p-3 dark:bg-slate-900/40">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Patient ID</div>
                        <div className="mt-0.5 truncate font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">{result.patientId}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyPatientId()}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <ClipboardCopy size={13} />{copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-amber-50/80 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    💡 Save your Patient ID — you'll need it to login and track your status.
                  </div>

                  <Link
                    to={`/patient/login?patientId=${encodeURIComponent(result.patientId)}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5"
                  >
                    Login to Track Status <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/80 py-16 text-center dark:border-slate-700/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
                    <ClipboardList size={26} />
                  </div>
                  <div className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">Complete the form to get your token</div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
