import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

/**
 * FloatingShield — CSS + Framer Motion implementation.
 * No React Three Fiber dependency.
 * Renders a glowing animated 3D-style shield.
 */
export default function FloatingShield({ height = 340, color = '#0EA5E9' }) {
  const secondaryColor = color === '#0EA5E9' ? '#6366F1' : '#22D3EE';

  return (
    <div
      style={{ width: '100%', height }}
      className="relative flex items-center justify-center"
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div style={{
          width: '55%', height: '55%',
          background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }} />
      </div>

      {/* Orbiting ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: height * 0.65,
          height: height * 0.65,
          borderColor: `${color}22`,
          borderWidth: 1,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {/* Orbiting dot */}
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </motion.div>

      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: height * 0.5,
          height: height * 0.5,
          borderColor: `${secondaryColor}18`,
          borderStyle: 'dashed',
          borderWidth: 1,
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Main shield body */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: height * 0.38,
            height: height * 0.38,
            background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Shield icon container */}
        <div
          className="relative flex items-center justify-center rounded-2xl"
          style={{
            width: height * 0.28,
            height: height * 0.32,
            background: `linear-gradient(135deg, ${color}22 0%, ${secondaryColor}18 100%)`,
            border: `2px solid ${color}50`,
            boxShadow: `0 0 40px ${color}30, 0 0 80px ${color}10, inset 0 1px 0 ${color}30`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${color}18 0%, transparent 70%)`,
            }}
          />

          <Shield
            size={height * 0.12}
            style={{ color, filter: `drop-shadow(0 0 12px ${color})` }}
            strokeWidth={1.5}
          />

          {/* Corner accents */}
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: color, opacity: 0.7 }} />
          <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full" style={{ background: secondaryColor, opacity: 0.7 }} />
        </div>

        {/* Pulsing base shadow */}
        <motion.div
          className="mt-2 rounded-full"
          style={{
            width: height * 0.2,
            height: 8,
            background: `radial-gradient(ellipse, ${color}40 0%, transparent 70%)`,
            filter: 'blur(6px)',
          }}
          animate={{ scaleX: [1, 0.7, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            background: i % 2 === 0 ? color : secondaryColor,
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
            opacity: 0.5,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2.5 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}
