import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

const Home           = lazy(() => import('../pages/Home'));
const About          = lazy(() => import('../pages/About'));
const Result         = lazy(() => import('../pages/Result'));
const History        = lazy(() => import('../pages/History'));
const Contact        = lazy(() => import('../pages/Contact'));
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

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/"        element={<Home />} />
          <Route path="/about"   element={<About />} />
          <Route path="/result"  element={<Result />} />
          <Route path="/history" element={<History />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/detect"  element={<Navigate to="/" replace />} />
          <Route path="*"        element={<NotFound />} />
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
