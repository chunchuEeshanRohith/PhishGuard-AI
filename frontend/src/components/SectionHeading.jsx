import { motion } from 'framer-motion';

export default function SectionHeading({ badge, title, highlight, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-16 ${center ? 'text-center' : ''}`}
    >
      {badge && (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 ${center ? 'justify-center' : ''}`}
          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', color: '#0EA5E9' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-phish-primary animate-pulse" />
          {badge}
        </div>
      )}

      <h2 className="text-4xl md:text-5xl font-bold font-grotesk leading-tight mb-4">
        {title}{' '}
        {highlight && (
          <span className="gradient-text">{highlight}</span>
        )}
      </h2>

      {subtitle && (
        <p className={`text-phish-muted text-lg leading-relaxed max-w-2xl ${center ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
