import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

const Home           = lazy(() => import('../pages/Home'));
const About          = lazy(() => import('../pages/About'));
const Result         = lazy(() => import('../pages/Result'));
const History        = lazy(() => import('../pages/History'));
const Contact        = lazy(() => import('../pages/Contact'));
const Forensics      = lazy(() => import('../pages/Forensics'));
const Model          = lazy(() => import('../pages/Model'));
const NotFound       = lazy(() => import('../pages/NotFound'));

// Admin Routes
const AdminLogin     = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminHistory   = lazy(() => import('../pages/admin/AdminHistory'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminSystem    = lazy(() => import('../pages/admin/AdminSystem'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl" style={{
          background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
          animation: 'spin 1s linear infinite',
        }} />
        <p className="text-phish-muted text-sm font-grotesk">Loading...</p>
      </div>
    </div>
  );
}

const Scanner        = lazy(() => import('../pages/Scanner'));

// Simple Placeholder Component
function Placeholder({ title }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] text-white flex items-center justify-center pt-20 pb-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400">This page is under construction.</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/"             element={<Home />} />
          <Route path="/about"        element={<About />} />
          <Route path="/scanner"      element={<Scanner />} />
          <Route path="/models"       element={<Model />} />
          <Route path="/model"        element={<Model />} />
          <Route path="/architecture" element={<Model />} />
          <Route path="/dashboard"    element={<Placeholder title="Dashboard" />} />
          <Route path="/research"     element={<Placeholder title="Research" />} />
          <Route path="/team"         element={<Placeholder title="Team" />} />
          <Route path="/contact"      element={<Contact />} />
          <Route path="/result"       element={<Result />} />
          <Route path="/history"      element={<History />} />
          <Route path="/forensics"    element={<Forensics />} />
          <Route path="/detect"       element={<Navigate to="/scanner" replace />} />
          <Route path="*"             element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="history"   element={<AdminHistory />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="system"    element={<AdminSystem />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
