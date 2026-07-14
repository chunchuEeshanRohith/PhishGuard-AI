import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Lock, Globe, Clock } from 'lucide-react';

const iconMap = { shield: Shield, brain: Brain, zap: Zap, lock: Lock, globe: Globe, history: Clock };

const colorMap = {
  primary:   { icon: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  glow: 'rgba(14,165,233,0.25)', border: 'rgba(14,165,233,0.3)'  },
  secondary: { icon: '#6366F1', bg: 'rgba(99,102,241,0.1)',  glow: 'rgba(99,102,241,0.25)', border: 'rgba(99,102,241,0.3)'  },
  accent:    { icon: '#22D3EE', bg: 'rgba(34,211,238,0.1)',  glow: 'rgba(34,211,238,0.25)', border: 'rgba(34,211,238,0.3)'  },
};

export default function FeatureCard({ icon, title, description, color = 'primary', stat, statLabel, index = 0 }) {
  const IconComponent = iconMap[icon] || Shield;
  const c = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative group p-6 rounded-2xl overflow-hidden cursor-default"
      style={{
        background: 'rgba(10,15,46,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${c.border}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Hover glow background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${c.glow}, transparent 70%)` }} />

      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${c.icon}, transparent)` }} />

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <IconComponent size={26} style={{ color: c.icon }} strokeWidth={1.8} />
        </motion.div>

        {/* Title */}
        <h3 className="font-grotesk font-bold text-xl text-white mb-3 group-hover:text-phish-accent transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-phish-muted text-sm leading-relaxed mb-5">
          {description}
        </p>

        {/* Stat */}
        {stat && (
          <div className="flex items-end gap-2 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="font-grotesk font-bold text-2xl" style={{ color: c.icon }}>{stat}</span>
            <span className="text-phish-muted text-xs mb-1">{statLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
