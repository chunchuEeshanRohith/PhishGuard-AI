import { motion } from 'framer-motion';

const variants = {
  primary: {
    base: 'text-white font-semibold',
    style: {
      background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
      boxShadow: '0 0 20px rgba(14,165,233,0.3)',
    },
    hover: { boxShadow: '0 0 40px rgba(14,165,233,0.5), 0 8px 24px rgba(0,0,0,0.3)' },
  },
  secondary: {
    base: 'text-white font-semibold',
    style: {
      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      boxShadow: '0 0 20px rgba(99,102,241,0.3)',
    },
    hover: { boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.3)' },
  },
  ghost: {
    base: 'text-phish-muted font-semibold',
    style: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.12)',
    },
    hover: { border: '1px solid rgba(14,165,233,0.5)', color: '#0EA5E9', background: 'rgba(14,165,233,0.05)' },
  },
  danger: {
    base: 'text-white font-semibold',
    style: {
      background: 'linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)',
      boxShadow: '0 0 20px rgba(239,68,68,0.3)',
    },
    hover: { boxShadow: '0 0 40px rgba(239,68,68,0.5)' },
  },
  success: {
    base: 'text-white font-semibold',
    style: {
      background: 'linear-gradient(135deg, #22C55E 0%, #14532D 100%)',
      boxShadow: '0 0 20px rgba(34,197,94,0.3)',
    },
    hover: { boxShadow: '0 0 40px rgba(34,197,94,0.5)' },
  },
};

const sizes = {
  sm:  'px-4 py-2 text-sm rounded-lg',
  md:  'px-6 py-3 text-base rounded-xl',
  lg:  'px-8 py-4 text-lg rounded-xl',
  xl:  'px-10 py-5 text-xl rounded-2xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { y: -2, ...v.hover }}
      whileTap={disabled || loading ? {} : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        inline-flex items-center justify-center gap-2.5 
        font-grotesk tracking-wide transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${v.base} ${s} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      style={v.style}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Scanning...</span>
        </>
      ) : (
        <>
          {Icon && !iconRight && <Icon className="w-5 h-5 shrink-0" />}
          {children}
          {Icon && iconRight && <Icon className="w-5 h-5 shrink-0" />}
        </>
      )}
    </motion.button>
  );
}
