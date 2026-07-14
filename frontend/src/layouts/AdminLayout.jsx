import { useEffect, useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, History, PieChart, Activity, LogOut, Shield, Menu, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = sessionStorage.getItem('phishguard_admin_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        setIsAuthenticated(data.authenticated === true);
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('phishguard_admin_session');
    navigate('/admin/login');
  };

  // Show nothing while checking auth status to prevent flicker
  if (isAuthenticated === null) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/history', icon: History, label: 'History' },
    { to: '/admin/analytics', icon: PieChart, label: 'Analytics' },
    { to: '/admin/system', icon: Activity, label: 'System Status' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-phish-bg border-r border-phish-primary/10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}>
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-grotesk font-bold text-white text-lg leading-tight">Admin Portal</h1>
          <p className="text-phish-primary text-xs font-medium">PhishGuard AI</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-grotesk font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-phish-primary/10 text-phish-primary border border-phish-primary/20' 
                  : 'text-phish-muted hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-grotesk font-medium text-phish-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-phish-bg">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Animated background subtle gradients */}
        <div className="absolute inset-0 flex pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-phish-primary/5 blur-[120px]" />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-phish-bg/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-phish-primary" />
            <span className="font-grotesk font-bold text-white">Admin Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-white"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
