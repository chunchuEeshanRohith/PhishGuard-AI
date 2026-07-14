import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, LayoutDashboard, History, Settings,
  Bell, Search, User, LogOut, ChevronRight, Menu, X, TrendingUp, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AnimatedBackground from '../components/AnimatedBackground';

const sidebarLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/detect',    icon: Zap,             label: 'Detection' },
  { to: '/history',   icon: History,         label: 'Scan History' },
  { to: '/about',     icon: TrendingUp,      label: 'Analytics' },
  { to: '/contact',   icon: Settings,        label: 'Settings' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useApp();

  return (
    <div className="relative min-h-screen flex" style={{ background: '#050816' }}>
      <AnimatedBackground showParticles={false} />

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden"
        style={{
          background: 'rgba(5,8,22,0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4 h-16 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 16px rgba(14,165,233,0.3)' }}>
            <Shield size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-grotesk font-bold text-white text-sm whitespace-nowrap">
              PhishGuard <span style={{ color: '#0EA5E9' }}>AI</span>
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {sidebarLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-grotesk font-medium transition-all ${
                  isActive ? 'text-phish-primary' : 'text-phish-muted hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' } : {}}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
                <User size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-grotesk font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-phish-muted truncate">{user?.email || 'admin@phishguard.ai'}</p>
              </div>
              <button onClick={logout} className="text-phish-muted hover:text-phish-danger transition-colors" title="Logout">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="w-full flex items-center justify-center py-2 text-phish-muted hover:text-phish-danger transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-30 transition-all hover:scale-110"
          style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)' }}
        >
          <ChevronRight size={12} className="text-phish-primary" style={{ transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b sticky top-0 z-10"
          style={{ background: 'rgba(5,8,22,0.9)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>

          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)} className="md:hidden text-phish-muted hover:text-white">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:flex items-center">
              <Search size={14} className="absolute left-3 text-phish-muted" />
              <input
                placeholder="Search scans, URLs..."
                className="input-cyber text-sm pl-9 py-2 w-56"
                style={{ borderRadius: '0.5rem', padding: '0.4rem 0.75rem 0.4rem 2.25rem' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-phish-muted hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-phish-danger" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
              <User size={14} className="text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
