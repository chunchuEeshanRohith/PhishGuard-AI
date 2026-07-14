import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';

const config = {
  safe:    { Icon: ShieldCheck, label: 'Legitimate', color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.35)',  glow: 'rgba(34,197,94,0.3)'  },
  danger:  { Icon: ShieldX,     label: 'Phishing',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.35)', glow: 'rgba(239,68,68,0.3)'  },
  warning: { Icon: AlertTriangle,label:'Suspicious', color: '#EAB308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.35)',glow: 'rgba(234,179,8,0.3)' },
};

export default function StatusBadge({ status, size = 'md', showLabel = true, pulse = true }) {
  const c = config[status] || config.warning;
  const { Icon } = c;

  const sizes = {
    sm: { icon: 14, text: 'text-xs', px: 'px-2.5 py-1', gap: 'gap-1.5' },
    md: { icon: 16, text: 'text-sm', px: 'px-3.5 py-1.5', gap: 'gap-2' },
    lg: { icon: 20, text: 'text-base', px: 'px-4 py-2', gap: 'gap-2.5' },
  };
  const sz = sizes[size] || sizes.md;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'backOut' }}
      className={`inline-flex items-center ${sz.gap} ${sz.px} rounded-full font-grotesk font-semibold ${sz.text}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        boxShadow: pulse ? `0 0 12px ${c.glow}` : 'none',
      }}
    >
      {pulse ? (
        <span className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex w-full h-full rounded-full opacity-50" style={{ background: c.color }} />
          <Icon size={sz.icon} strokeWidth={2} />
        </span>
      ) : (
        <Icon size={sz.icon} strokeWidth={2} />
      )}
      {showLabel && c.label}
    </motion.span>
  );
}
