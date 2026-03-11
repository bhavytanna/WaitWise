import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Input, Label, Select } from '../components/ui';
import { clearAuth, getAuth } from '../services/authStore';
import type { AdminStats } from '../services/hospitalApi';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Activity,
  BarChart3,
  ClipboardPlus,
  Clock,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react';
import {
  addDoctor,
  adminSetPatientPriority,
  adminStats,
  deleteDoctor,
  listTriagePatients,
  updateConsultTime,
  type TriagePatientDto,
} from '../services/hospitalApi';

type AddDoctorForm = {
  name: string;
  department: string;
  departmentCode: string;
  avgConsultTime: string;
  username: string;
  password?: string;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [auth] = useState(() => getAuth());

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [triageDoctorId, setTriageDoctorId] = useState('');
  const [triagePatients, setTriagePatients] = useState<TriagePatientDto[]>([]);
  const [triageLoading, setTriageLoading] = useState(false);
  const [form, setForm] = useState<AddDoctorForm>({
    name: '',
    department: '',
    departmentCode: '',
    avgConsultTime: '8',
    username: '',
    password: '',
  });

  useEffect(() => {
    if (!auth || auth.user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    adminStats()
      .then(setStats)
      .catch((e: any) => setError(e?.message ?? 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, [auth, navigate]);

  const doctors = useMemo(() => stats?.doctors ?? [], [stats]);
  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Waiting', value: stats.totals.waiting, color: '#3b82f6' }, // blue-500
      { name: 'In Consult', value: stats.totals.in_consultation, color: '#f59e0b' }, // amber-500
      { name: 'Done', value: stats.totals.done, color: '#10b981' }, // emerald-500
    ];
  }, [stats]);

  useEffect(() => {
    if (!triageDoctorId && doctors.length > 0) {
      setTriageDoctorId(doctors[0]!.id);
    }
  }, [doctors, triageDoctorId]);

  async function refreshTriage() {
    if (!triageDoctorId) return;
    setTriageLoading(true);
    setError(null);
    try {
      setTriagePatients(await listTriagePatients(triageDoctorId));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load triage patients');
    } finally {
      setTriageLoading(false);
    }
  }

  useEffect(() => {
    void refreshTriage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triageDoctorId]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      setStats(await adminStats());
    } catch (e: any) {
      setError(e?.message ?? 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }

  async function onAddDoctor(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const avg = Number(form.avgConsultTime);
    if (!form.name.trim()) return setError('Doctor name is required');
    if (!form.department.trim()) return setError('Department is required');
    if (!form.departmentCode.trim()) return setError('Department code is required (example: C)');
    if (!Number.isFinite(avg) || avg < 1 || avg > 120) return setError('Avg consultation time must be 1-120');
    if (!form.username.trim() || form.username.trim().length < 3) return setError('Username is required (min 3 chars)');

    setBusy(true);
    try {
      await addDoctor({
        name: form.name.trim(),
        department: form.department.trim(),
        departmentCode: form.departmentCode.trim(),
        avgConsultTime: avg,
        username: form.username.trim(),
        password: form.password?.trim() || undefined,
      });
      setForm({ name: '', department: '', departmentCode: '', avgConsultTime: '8', username: '', password: '' });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add doctor');
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteDoctor(id: string) {
    if (!confirm('Delete this doctor?')) return;
    setBusy(true);
    setError(null);
    try {
      await deleteDoctor(id);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to delete doctor');
    } finally {
      setBusy(false);
    }
  }

  async function onUpdateConsultTime(id: string, avgConsultTime: number) {
    setBusy(true);
    setError(null);
    try {
      await updateConsultTime(id, avgConsultTime);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update consultation time');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Admin Dashboard</h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">Manage doctors, triage emergencies, and view analytics.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              <RefreshCw size={16} /> Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearAuth();
                navigate('/admin/login');
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

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">
            <Card className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">System Overview</div>
                <Activity size={18} className="text-slate-400 dark:text-slate-500" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Doctors</span>
                    <Stethoscope size={14} />
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{stats?.doctorCount ?? '-'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Patients</span>
                    <Users size={14} />
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{stats?.patientCount ?? '-'}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  Waiting: <Badge>{stats?.totals.waiting ?? 0}</Badge> Called: <Badge>{stats?.totals.called ?? 0}</Badge>
                </div>
                <div>
                  In consultation: <Badge>{stats?.totals.in_consultation ?? 0}</Badge> Done: <Badge>{stats?.totals.done ?? 0}</Badge>
                </div>
              </div>

              {loading ? <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading…</div> : null}
            </Card>

            <Card className="mt-6 flex-1 drop-shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Patient Flow Analytics</div>
                <BarChart3 size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
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
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Add Doctor</h3>
                <ClipboardPlus size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <form onSubmit={onAddDoctor} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Department Code</Label>
                  <Input
                    value={form.departmentCode}
                    onChange={(e) => setForm((f) => ({ ...f, departmentCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Avg Consult Time (min)</Label>
                  <Input
                    inputMode="numeric"
                    value={form.avgConsultTime}
                    onChange={(e) => setForm((f) => ({ ...f, avgConsultTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="e.g. jdoe"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Leave blank for 'password123'"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button type="submit" disabled={busy}>
                    {busy ? 'Please wait…' : 'Add Doctor'}
                  </Button>
                </div>
              </form>
            </Card>

            <div className="mt-6">
              <Card>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Doctors</h3>
                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Manage consultation time & remove doctors</div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-6 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                    <div className="col-span-2">Doctor</div>
                    <div>Waiting</div>
                    <div>Called</div>
                    <div>Avg (min)</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {doctors.length === 0 ? (
                      <div className="px-3 py-6 text-sm text-slate-500 dark:text-slate-400">No doctors found.</div>
                    ) : (
                      doctors.map((d) => (
                        <div key={d.id} className="grid grid-cols-6 items-center gap-2 px-3 py-2 text-sm dark:bg-slate-900">
                          <div className="col-span-2">
                            <div className="font-semibold text-slate-900 dark:text-slate-50">{d.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{d.department}</div>
                          </div>
                          <div>
                            <Badge>{d.queue.waiting}</Badge>
                          </div>
                          <div>
                            <Badge>{d.queue.called}</Badge>
                          </div>
                          <div>
                            <input
                              className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-1 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                              type="number"
                              min={1}
                              max={120}
                              defaultValue={d.avgConsultTime}
                              onBlur={(e) => {
                                const v = Number(e.target.value);
                                if (Number.isFinite(v) && v >= 1 && v <= 120 && v !== d.avgConsultTime) {
                                  void onUpdateConsultTime(d.id, v);
                                }
                              }}
                            />
                          </div>
                          <div className="text-right">
                            <Button variant="danger" disabled={busy} onClick={() => onDeleteDoctor(d.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
        >
          <Card>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">Triage</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Mark patients as emergency to prioritize them in the queue.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={triageDoctorId}
                  disabled={loading || doctors.length === 0}
                  onChange={(e) => setTriageDoctorId(e.target.value)}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
                <Button variant="secondary" onClick={refreshTriage} disabled={triageLoading || !triageDoctorId}>
                  <RefreshCw size={16} /> Refresh
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-5 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <div>Token</div>
                <div>Patient</div>
                <div>Status</div>
                <div>Priority</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {triageLoading ? (
                  <div className="px-3 py-6 text-sm text-slate-500 dark:text-slate-400">Loading…</div>
                ) : triagePatients.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-slate-500 dark:text-slate-400">No active patients.</div>
                ) : (
                  <AnimatePresence initial={false}>
                    {triagePatients.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className={`grid grid-cols-5 items-center gap-2 px-3 py-2 text-sm ${
                          p.priority === 'emergency'
                            ? 'bg-rose-50 dark:bg-rose-950/20'
                            : 'bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-slate-50">{p.tokenNumber}</div>
                        <div className="text-slate-700 dark:text-slate-200">{p.name}</div>
                        <div>
                          <Badge>{p.status}</Badge>
                        </div>
                        <div>
                          {p.priority === 'emergency' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                              <ShieldAlert size={14} /> EMERGENCY
                            </span>
                          ) : (
                            <Badge>normal</Badge>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant={p.priority === 'emergency' ? 'secondary' : 'danger'}
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError(null);
                              try {
                                await adminSetPatientPriority(p.id, p.priority === 'emergency' ? 'normal' : 'emergency');
                                await refreshTriage();
                              } catch (e: any) {
                                setError(e?.message ?? 'Failed to update priority');
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            {p.priority === 'emergency' ? (
                              <>
                                <Clock size={16} /> Unmark
                              </>
                            ) : (
                              <>
                                <ShieldAlert size={16} /> Mark emergency
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
}
