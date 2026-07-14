import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, Zap, Clock, BarChart3, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dashboardStats } from '../utils/mockData';
import StatusBadge from '../components/StatusBadge';

function StatCard({ label, value, change, trend, color, index }) {
  const colorMap = {
    primary:   { text: '#0EA5E9', bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.2)'  },
    danger:    { text: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
    success:   { text: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'   },
    secondary: { text: '#6366F1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)'  },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="rounded-2xl p-5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-phish-muted text-xs font-grotesk uppercase tracking-wider">{label}</p>
        <div className={`flex items-center gap-1 text-xs font-grotesk font-medium ${trend === 'up' ? 'text-phish-success' : 'text-phish-danger'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
      </div>
      <p className="font-grotesk font-bold text-3xl" style={{ color: c.text }}>{value}</p>
    </motion.div>
  );
}

function ChartPlaceholder({ title, type }) {
  const bars = Array.from({ length: 14 }, () => 20 + Math.random() * 80);

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-grotesk font-semibold text-white text-sm">{title}</h3>
        <div className="flex gap-2">
          {['7D', '30D', '90D'].map(p => (
            <button key={p} className="text-[10px] font-grotesk px-2 py-1 rounded text-phish-muted first:text-phish-primary first:bg-phish-primary/10">
              {p}
            </button>
          ))}
        </div>
      </div>

      {type === 'bar' ? (
        <div className="flex items-end gap-1.5 h-24">
          {bars.map((h, i) => (
            <motion.div key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 rounded-sm"
              style={{ background: i % 3 === 0 ? 'rgba(239,68,68,0.6)' : 'rgba(14,165,233,0.4)' }}
            />
          ))}
        </div>
      ) : (
        <div className="relative h-24">
          <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,60 Q30,40 60,45 T120,30 T180,35 T240,20 T300,15"
              stroke="#0EA5E9" strokeWidth="2" fill="none" />
            <path d="M0,60 Q30,40 60,45 T120,30 T180,35 T240,20 T300,15 L300,80 L0,80 Z"
              fill="url(#lineGrad)" />
          </svg>
        </div>
      )}

      <div className="mt-3 flex gap-4 text-[10px] text-phish-muted font-inter">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phish-primary inline-block" /> Safe</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phish-danger inline-block" /> Phishing</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { history } = useApp();
  const recent = history.slice(0, 6);

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl text-white mb-1">Dashboard</h1>
        <p className="text-phish-muted text-sm">Welcome back! Here's your phishing detection overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map((s, i) => (
          <StatCard key={i} {...s} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <ChartPlaceholder title="Detection Activity (Last 14 Days)" type="bar" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <ChartPlaceholder title="Scan Volume Over Time" type="line" />
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h3 className="font-grotesk font-semibold text-white text-sm">Recent Scans</h3>
            <Link to="/history" className="text-xs text-phish-primary hover:underline font-grotesk">View All →</Link>
          </div>
          <div>
            {recent.length === 0 ? (
              <div className="text-center py-10 text-phish-muted text-sm">
                <Shield size={28} className="mx-auto mb-2 opacity-30" />
                No scans yet
              </div>
            ) : (
              recent.map((item, i) => (
                <div key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 border-b last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    {item.status === 'safe'
                      ? <CheckCircle size={15} className="shrink-0" style={{ color: '#22C55E' }} />
                      : <AlertTriangle size={15} className="shrink-0" style={{ color: '#EF4444' }} />
                    }
                    <span className="font-inter text-xs text-phish-muted truncate max-w-xs">{item.url}</span>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <span className="font-inter text-xs font-semibold"
                      style={{ color: item.status === 'safe' ? '#22C55E' : '#EF4444' }}>
                      {item.confidence}%
                    </span>
                    <StatusBadge status={item.status} size="sm" pulse={false} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="font-grotesk font-semibold text-white text-sm mb-5">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { icon: Zap, label: 'Scan New URL', to: '/detect', color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)' },
              { icon: Activity, label: 'View History', to: '/history', color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
              { icon: BarChart3, label: 'Analytics', to: '/about', color: '#22D3EE', bg: 'rgba(34,211,238,0.1)' },
              { icon: Clock, label: 'Recent Activity', to: '/history', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
            ].map(({ icon: Icon, label, to, color, bg }) => (
              <Link key={label} to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:scale-[1.01]"
                style={{ background: bg, border: `1px solid ${color}25` }}>
                <Icon size={16} style={{ color }} />
                <span className="font-grotesk font-medium text-sm text-white">{label}</span>
              </Link>
            ))}
          </div>

          {/* Threat distribution donut placeholder */}
          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h4 className="font-grotesk font-medium text-white text-xs mb-4 uppercase tracking-wider">Threat Distribution</h4>
            <div className="flex items-center justify-center mb-4">
              <svg width="80" height="80" viewBox="0 0 80 80">
                {/* Safe arc ~70% */}
                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(34,197,94,0.8)" strokeWidth="10"
                  strokeDasharray="132 188" strokeDashoffset="0" strokeLinecap="round"
                  transform="rotate(-90 40 40)" />
                {/* Danger arc ~30% */}
                <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(239,68,68,0.8)" strokeWidth="10"
                  strokeDasharray="56 188" strokeDashoffset="-132" strokeLinecap="round"
                  transform="rotate(-90 40 40)" />
                <text x="40" y="44" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Space Grotesk">70%</text>
              </svg>
            </div>
            <div className="flex justify-center gap-4 text-[10px] font-inter text-phish-muted">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-phish-success" /> Safe (70%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-phish-danger" /> Danger (30%)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
