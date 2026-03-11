import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Input, Label, Select, Button, Alert, Badge } from '../components/ui';
import type { DoctorDto, RegisterPatientResult } from '../services/hospitalApi';
import { listDoctors, registerPatient } from '../services/hospitalApi';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardCopy, Phone, Stethoscope, User } from 'lucide-react';

type FormState = {
  name: string;
  age: string;
  phone: string;
  doctorId: string;
};

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
        if (d.length === 0) {
          setError('No doctors available. Run the seed script or add doctors as admin.');
        }
        setDoctors(d);
        setForm((f) => ({ ...f, doctorId: f.doctorId || (d[0]?.id ?? '') }));
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

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === form.doctorId) ?? null,
    [doctors, form.doctorId],
  );

  useEffect(() => {
    if (form.doctorId) return;
    if (doctors.length === 0) return;
    setForm((f) => ({ ...f, doctorId: doctors[0]!.id }));
  }, [doctors, form.doctorId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const ageNum = Number(form.age);
    if (!form.name.trim()) return setError('Name is required');
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) return setError('Enter valid age (0-120)');
    if (!form.phone.trim() || form.phone.trim().length < 7) return setError('Enter valid phone number');
    if (!form.doctorId) return setError('Select a doctor');

    setSubmitting(true);
    try {
      const data = await registerPatient({
        name: form.name.trim(),
        age: ageNum,
        phone: form.phone.trim(),
        doctorId: form.doctorId,
      });
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
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Container className="pt-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Patient Registration</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                Register to receive a token and track your status in real time.
              </p>
            </div>
            <Link
              to="/queue/live"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View Live Queue
            </Link>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200">
                1
              </span>
              Fill your details
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200">
                2
              </span>
              Select a doctor
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200">
                3
              </span>
              Get token + Patient ID
            </div>
          </div>

          <div className="mt-6">
            <Card>
              <form onSubmit={onSubmit} className="space-y-4">
                {error ? <Alert title="Error" message={error} /> : null}

                <div>
                  <Label className="flex items-center gap-2">
                    <User size={16} /> Name
                  </Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Age</Label>
                    <Input
                      inputMode="numeric"
                      value={form.age}
                      onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone size={16} /> Phone
                    </Label>
                    <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Stethoscope size={16} /> Doctor
                  </Label>
                  <Select
                    disabled={loading}
                    value={form.doctorId}
                    onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                  >
                    <option value="" disabled>
                      Select a doctor
                    </option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.department})
                      </option>
                    ))}
                  </Select>
                  {selectedDoctor ? (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Avg consult time: <Badge>{selectedDoctor.avgConsultTime} min</Badge>
                    </div>
                  ) : null}
                </div>

                <Button type="submit" disabled={submitting || loading || doctors.length === 0} className="w-full">
                  {submitting ? 'Submitting…' : 'Register & Get Token'}
                </Button>

                {loading ? <div className="text-sm text-slate-500 dark:text-slate-400">Loading doctors…</div> : null}
              </form>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Your Token</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">After registration, details will appear here.</p>

            {result ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <CheckCircle2 size={18} />
                  <div className="text-sm font-semibold">Registration successful</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Token Number</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{result.tokenNumber}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Doctor</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{result.doctorName}</div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Patient ID</div>
                      <div className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {result.patientId}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyPatientId()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                      title="Copy Patient ID"
                    >
                      <ClipboardCopy size={16} />
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Patients Ahead</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{result.patientsAhead}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Wait</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {result.estimatedWaitTimeMinutes} min
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
                  Save your Patient ID to login and track your status.
                </div>

                <Link
                  to={`/patient/login?patientId=${encodeURIComponent(result.patientId)}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Login to Track Status
                </Link>
              </motion.div>
            ) : (
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">No registration yet.</div>
            )}
          </Card>
        </motion.div>
      </div>
    </Container>
  );
}
