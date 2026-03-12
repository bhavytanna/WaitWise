import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Container, Input, Label, Select, SectionHeader } from '../components/ui';
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
  TrendingUp,
  UserCheck,
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
  name: string; department: string; departmentCode: string;
  avgConsultTime: string; username: string; password?: string;
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
    name: '', department: '', departmentCode: '', avgConsultTime: '8', username: '', password: '',
  });

  useEffect(() => {
    if (!auth || auth.user.role !== 'admin') { navigate('/admin/login'); return; }
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
      { name: 'Waiting', value: stats.totals.waiting, color: '#6366f1' },
      { name: 'In Consult', value: stats.totals.in_consultation, color: '#f59e0b' },
      { name: 'Done', value: stats.totals.done, color: '#10b981' },
    ];
  }, [stats]);

  useEffect(() => {
    if (!triageDoctorId && doctors.length > 0) setTriageDoctorId(doctors[0]!.id);
  }, [doctors, triageDoctorId]);

  async function refreshTriage() {
    if (!triageDoctorId) return;
    setTriageLoading(true);
    setError(null);
    try { setTriagePatients(await listTriagePatients(triageDoctorId)); }
    catch (e: any) { setError(e?.message ?? 'Failed to load triage patients'); }
    finally { setTriageLoading(false); }
  }

  useEffect(() => { void refreshTriage(); }, [triageDoctorId]);

  async function refresh() {
    setError(null); setLoading(true);
    try { setStats(await adminStats()); }
    catch (e: any) { setError(e?.message ?? 'Failed to refresh'); }
    finally { setLoading(false); }
  }

  async function onAddDoctor(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const avg = Number(form.avgConsultTime);
    if (!form.name.trim()) return setError('Doctor name is required');
    if (!form.department.trim()) return setError('Department is required');
    if (!form.departmentCode.trim()) return setError('Department code is required');
    if (!Number.isFinite(avg) || avg < 1 || avg > 120) return setError('Avg consultation time must be 1–120');
    if (!form.username.trim() || form.username.trim().length < 3) return setError('Username required (min 3 chars)');
    setBusy(true);
    try {
      await addDoctor({ name: form.name.trim(), department: form.department.trim(), departmentCode: form.departmentCode.trim(), avgConsultTime: avg, username: form.username.trim(), password: form.password?.trim() || undefined });
      setForm({ name: '', department: '', departmentCode: '', avgConsultTime: '8', username: '', password: '' });
      await refresh();
    } catch (e: any) { setError(e?.message ?? 'Failed to add doctor'); }
    finally { setBusy(false); }
  }

  async function onDeleteDoctor(id: string) {
    if (!confirm('Delete this doctor?')) return;
    setBusy(true); setError(null);
    try { await deleteDoctor(id); await refresh(); }
    catch (e: any) { setError(e?.message ?? 'Failed to delete doctor'); }
    finally { setBusy(false); }
  }

  async function onUpdateConsultTime(id: string, avgConsultTime: number) {
    setBusy(true); setError(null);
    try { await updateConsultTime(id, avgConsultTime); await refresh(); }
    catch (e: any) { setError(e?.message ?? 'Failed to update consultation time'); }
    finally { setBusy(false); }
  }

  const statItems = [
    { label: 'Total Doctors', value: stats?.doctorCount ?? '-', icon: Stethoscope, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Total Patients', value: stats?.patientCount ?? '-', icon: Users, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40' },
    { label: 'Waiting', value: stats?.totals.waiting ?? 0, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Done Today', value: stats?.totals.done ?? 0, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  return (
    <Container className="pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-md shadow-rose-500/25">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Admin Dashboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage doctors, triage, and analytics</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={refresh} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button variant="secondary" onClick={() => { clearAuth(); navigate('/admin/login'); }}>
              <LogOut size={15} /> Logout
            </Button>
          </div>
        </div>

        {error && <div className="mt-4"><Alert title="Error" message={error} /></div>}

        {/* Stat Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon size={15} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-50">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Column 1: Analytics */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="flex flex-col gap-6">
            <Card>
              <SectionHeader title="Patient Flow" subtitle="Live status breakdown" icon={<BarChart3 size={16} />} />
              <div className="mt-4 h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 dark:bg-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">In Consult</span>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{stats?.totals.in_consultation ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 dark:bg-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Called</span>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{stats?.totals.called ?? 0}</Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Column 2-3: Forms */}
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
            <Card>
              <SectionHeader title="Add Doctor" subtitle="Create a new doctor account" icon={<ClipboardPlus size={16} />} />
              <form onSubmit={onAddDoctor} className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Dr. Jane Smith' },
                  { label: 'Department', key: 'department', placeholder: 'Cardiology' },
                  { label: 'Dept. Code', key: 'departmentCode', placeholder: 'C' },
                  { label: 'Avg Consult (min)', key: 'avgConsultTime', placeholder: '8' },
                  { label: 'Username', key: 'username', placeholder: 'jsmith' },
                  { label: 'Password', key: 'password', placeholder: 'Leave blank for default' },
                ].map((f) => (
                  <div key={f.key}>
                    <Label>{f.label}</Label>
                    <Input
                      type={f.key === 'password' ? 'password' : 'text'}
                      inputMode={f.key === 'avgConsultTime' ? 'numeric' : undefined}
                      value={(form as any)[f.key] ?? ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={busy}>
                    {busy ? 'Adding…' : 'Add Doctor'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Doctors List */}
            <div className="mt-6">
              <Card>
                <SectionHeader title="Doctors" subtitle="Manage consultation time & remove doctors" icon={<Stethoscope size={16} />} />
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50">
                  <div className="table-header grid-cols-6">
                    <div className="col-span-2">Doctor</div>
                    <div>Waiting</div>
                    <div>Called</div>
                    <div>Avg (min)</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                    {doctors.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No doctors yet.</div>
                    ) : doctors.map((d) => (
                      <div key={d.id} className="table-row grid-cols-6 bg-white dark:bg-slate-900/30">
                        <div className="col-span-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                              <Stethoscope size={14} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-50">{d.name}</div>
                              <div className="text-xs text-slate-400 dark:text-slate-500">{d.department}</div>
                            </div>
                          </div>
                        </div>
                        <div><Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{d.queue.waiting}</Badge></div>
                        <div><Badge>{d.queue.called}</Badge></div>
                        <div>
                          <input
                            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
                            type="number" min={1} max={120} defaultValue={d.avgConsultTime}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (Number.isFinite(v) && v >= 1 && v <= 120 && v !== d.avgConsultTime) void onUpdateConsultTime(d.id, v);
                            }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button variant="danger" disabled={busy} onClick={() => onDeleteDoctor(d.id)} className="text-xs px-3 py-1.5">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Triage Section */}
        <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <SectionHeader
                title="Emergency Triage"
                subtitle="Mark patients as emergency to prioritize them in the queue."
                icon={<ShieldAlert size={16} className="text-rose-500" />}
              />
              <div className="flex items-center gap-2">
                <Select value={triageDoctorId} disabled={loading || doctors.length === 0} onChange={(e) => setTriageDoctorId(e.target.value)} className="text-xs py-1.5">
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                <Button variant="secondary" onClick={refreshTriage} disabled={triageLoading || !triageDoctorId}>
                  <RefreshCw size={14} className={triageLoading ? 'animate-spin' : ''} /> Refresh
                </Button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/50">
              <div className="table-header grid-cols-5">
                <div>Token</div>
                <div>Patient</div>
                <div>Status</div>
                <div>Priority</div>
                <div className="text-right">Action</div>
              </div>
              <div className="divide-y divide-slate-100/80 dark:divide-slate-800/60">
                {triageLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">Loading…</div>
                ) : triagePatients.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No active patients.</div>
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
                        className={`table-row grid-cols-5 ${p.priority === 'emergency' ? 'bg-rose-50/70 dark:bg-rose-950/20' : 'bg-white dark:bg-slate-900/30'}`}
                      >
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-50">{p.tokenNumber}</div>
                        <div className="text-slate-700 dark:text-slate-200">{p.name}</div>
                        <div><Badge>{p.status}</Badge></div>
                        <div>
                          {p.priority === 'emergency' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                              <ShieldAlert size={12} /> EMERGENCY
                            </span>
                          ) : <Badge>normal</Badge>}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant={p.priority === 'emergency' ? 'secondary' : 'danger'}
                            disabled={busy}
                            className="text-xs px-3 py-1.5"
                            onClick={async () => {
                              setBusy(true); setError(null);
                              try { await adminSetPatientPriority(p.id, p.priority === 'emergency' ? 'normal' : 'emergency'); await refreshTriage(); }
                              catch (e: any) { setError(e?.message ?? 'Failed to update priority'); }
                              finally { setBusy(false); }
                            }}
                          >
                            {p.priority === 'emergency' ? <><Clock size={13} /> Unmark</> : <><ShieldAlert size={13} /> Emergency</>}
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
