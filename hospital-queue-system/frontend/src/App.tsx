import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import LiveQueuePage from './pages/LiveQueuePage';
import DoctorLoginPage from './pages/DoctorLoginPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PatientLoginPage from './pages/PatientLoginPage';
import PatientDashboardPage from './pages/PatientDashboardPage';

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom spring-like easing 
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="app-blob app-blob-a absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-400/60 blur-2xl dark:bg-blue-500/18" />
        <div className="app-blob app-blob-b absolute -right-24 -top-20 h-96 w-96 rounded-full bg-violet-400/60 blur-2xl dark:bg-violet-500/18" />
        <div className="app-blob app-blob-c absolute -bottom-28 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-400/55 blur-2xl dark:bg-emerald-500/16" />
      </div>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/patient/register" element={<PageTransition><PatientRegistrationPage /></PageTransition>} />
          <Route path="/patient/login" element={<PageTransition><PatientLoginPage /></PageTransition>} />
          <Route path="/patient/dashboard" element={<PageTransition><PatientDashboardPage /></PageTransition>} />
          <Route path="/queue/live" element={<PageTransition><LiveQueuePage /></PageTransition>} />
          <Route path="/doctor/login" element={<PageTransition><DoctorLoginPage /></PageTransition>} />
          <Route path="/doctor/dashboard" element={<PageTransition><DoctorDashboardPage /></PageTransition>} />
          <Route path="/admin/login" element={<PageTransition><AdminLoginPage /></PageTransition>} />
          <Route path="/admin/dashboard" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
