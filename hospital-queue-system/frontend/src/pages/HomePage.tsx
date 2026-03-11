import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardPlus, ShieldAlert, Stethoscope, Ticket, UserRound } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-200/60 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full bg-violet-200/70 blur-3xl dark:bg-violet-500/10" />
          <div className="absolute -bottom-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-500/10" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
            }}
            className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl shadow-slate-200/20 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/50 dark:shadow-none sm:p-12"
          >
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
              <div className="max-w-2xl">
                <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
                    <ShieldAlert size={14} className="text-rose-500" />
                    Real-time WaitWise patient triage
                  </div>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                  <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                    WaitWise <br/><span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Patient Triage</span>
                  </h1>
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                  <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
                    Register, get a token, and track your queue in real time. Emergency patients can be prioritized through triage.
                  </p>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="mt-8 grid gap-4 sm:grid-cols-3">
                  <Link
                    to="/patient/register"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:from-blue-600 dark:to-blue-500"
                  >
                    <ClipboardPlus size={18} /> Register
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/patient/login"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 sm:py-3.5 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-50 dark:hover:bg-slate-900"
                  >
                    <UserRound size={18} /> Patient Login
                  </Link>
                  <Link
                    to="/queue/live"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 sm:py-3.5 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-50 dark:hover:bg-slate-900"
                  >
                    <Ticket size={18} /> Live Queue
                  </Link>
                </motion.div>
              </div>

              <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="grid w-full gap-4 sm:grid-cols-2 lg:w-[480px]">
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Link
                    to="/doctor/login"
                    className="block h-full rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-950/90 dark:hover:shadow-slate-900/50"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800/50">
                        <Stethoscope size={24} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-50">Doctor Login</div>
                        <div className="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">Manage your queue and call next patient.</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Link
                    to="/admin/login"
                    className="block h-full rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-950/90 dark:hover:shadow-slate-900/50"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:ring-rose-800/50">
                        <ShieldAlert size={24} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-900 dark:text-slate-50">Admin Login</div>
                        <div className="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">Add doctors, triage, and view analytics.</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
