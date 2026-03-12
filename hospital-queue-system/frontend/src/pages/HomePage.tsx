import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ClipboardPlus,
  ShieldAlert,
  Stethoscope,
  Ticket,
  UserRound,
  Clock,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { listDoctors, getQueue } from '../services/hospitalApi';

const featureCards = [
  {
    icon: Zap,
    title: 'Instant Token',
    desc: 'Get your queue token in seconds after registration.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    ring: 'ring-amber-100 dark:ring-amber-900/40',
  },
  {
    icon: Clock,
    title: 'Live Wait Time',
    desc: 'See exactly how many patients are ahead of you.',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    ring: 'ring-blue-100 dark:ring-blue-900/40',
  },
  {
    icon: CheckCircle2,
    title: 'Smart Triage',
    desc: 'Emergency patients are automatically prioritized.',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    ring: 'ring-rose-100 dark:ring-rose-900/40',
  },
];

type LiveStats = {
  doctors: number;
  waiting: number;
  inConsult: number;
  done: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<LiveStats>({ doctors: 0, waiting: 0, inConsult: 0, done: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const doctors = await listDoctors();
        if (!mounted) return;
        const queueResults = await Promise.allSettled(doctors.map((d) => getQueue(d.id)));
        if (!mounted) return;
        let waiting = 0, inConsult = 0, done = 0;
        for (const result of queueResults) {
          if (result.status === 'fulfilled') {
            for (const item of result.value.queue) {
              if (item.status === 'waiting' || item.status === 'called') waiting++;
              else if (item.status === 'in_consultation') inConsult++;
              else if (item.status === 'done') done++;
            }
          }
        }
        setStats({ doctors: doctors.length, waiting, inConsult, done });
        setStatsLoaded(true);
      } catch {
        setStatsLoaded(true);
      }
    }
    void fetchStats();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-indigo-300/25 blur-[80px] dark:bg-indigo-600/12" />
          <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-violet-300/25 blur-[80px] dark:bg-violet-600/12" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-sky-300/20 blur-[80px] dark:bg-sky-600/10" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 lg:pt-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
            {/* Left: Copy */}
            <div className="max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  </span>
                  Real-time hospital queue management
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl lg:leading-[1.1]"
              >
                Skip the wait,{' '}
                <span className="gradient-text">not the care.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400"
              >
                WaitWise gives every patient a real-time token and live queue view.
                Emergency triage bumps critical patients instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  to="/patient/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(99,102,241,0.50)] active:scale-95"
                >
                  <ClipboardPlus size={17} />
                  Register Now
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/patient/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-95 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600"
                >
                  <UserRound size={17} />
                  Patient Login
                </Link>
                <Link
                  to="/queue/live"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-95 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600"
                >
                  <Ticket size={17} />
                  Live Queue
                </Link>
              </motion.div>
            </div>

            {/* Right: portal cards */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="grid w-full gap-4 sm:grid-cols-2 lg:w-[420px] lg:shrink-0"
            >
              {[
                {
                  to: '/doctor/login',
                  icon: Stethoscope,
                  label: 'Doctor Portal',
                  desc: 'Manage your queue, call patients, mark emergencies.',
                  iconColor: 'text-blue-600 dark:text-blue-400',
                  iconBg: 'bg-blue-50 dark:bg-blue-950/40 ring-blue-100 dark:ring-blue-900/30',
                },
                {
                  to: '/admin/login',
                  icon: ShieldAlert,
                  label: 'Admin Portal',
                  desc: 'Add doctors, triage emergencies, view analytics.',
                  iconColor: 'text-rose-600 dark:text-rose-400',
                  iconBg: 'bg-rose-50 dark:bg-rose-950/40 ring-rose-100 dark:ring-rose-900/30',
                },
              ].map((card) => (
                <motion.div
                  key={card.to}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.22 }}
                >
                  <Link
                    to={card.to}
                    className="group block h-full rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-slate-300/60 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/70 dark:hover:border-slate-700/60"
                  >
                    <div className="flex flex-col gap-4">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${card.iconBg} ${card.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                        <card.icon size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-50">
                          {card.label}
                          <ArrowRight size={14} className="opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                        </div>
                        <div className="mt-1.5 text-sm leading-snug text-slate-500 dark:text-slate-400">{card.desc}</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {featureCards.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group rounded-2xl border border-slate-200/60 ${f.bg} p-6 ring-1 ${f.ring} transition-all duration-300 hover:shadow-lg dark:border-slate-800/40`}
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Stats bar — dynamic from API */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/40 sm:grid-cols-4"
        >
          {[
            { label: 'Active Doctors', value: stats.doctors },
            { label: 'Patients Waiting', value: stats.waiting },
            { label: 'In Consultation', value: stats.inConsult },
            { label: 'Served Today', value: stats.done },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold gradient-text">
                {statsLoaded ? s.value : (
                  <span className="inline-block h-7 w-8 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                )}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
