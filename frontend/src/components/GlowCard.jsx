import { motion } from 'framer-motion';

const colorMap = {
  primary:   { glow: 'rgba(14,165,233,0.3)',  border: 'rgba(14,165,233,0.4)',  bg: 'rgba(14,165,233,0.08)'  },
  secondary: { glow: 'rgba(99,102,241,0.3)',  border: 'rgba(99,102,241,0.4)',  bg: 'rgba(99,102,241,0.08)'  },
  accent:    { glow: 'rgba(34,211,238,0.3)',  border: 'rgba(34,211,238,0.4)',  bg: 'rgba(34,211,238,0.08)'  },
  danger:    { glow: 'rgba(239,68,68,0.3)',   border: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.08)'   },
  success:   { glow: 'rgba(34,197,94,0.3)',   border: 'rgba(34,197,94,0.4)',   bg: 'rgba(34,197,94,0.08)'   },
};

export default function GlowCard({ children, color = 'primary', className = '', hover = true, onClick }) {
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(10,15,46,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${c.border}`,
        boxShadow: `0 0 30px ${c.glow}, 0 8px 32px rgba(0,0,0,0.3)`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${c.bg} 0%, transparent 100%)` }} />

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${c.glow}, transparent 70%)` }} />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
