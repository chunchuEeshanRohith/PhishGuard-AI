/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        'phish': {
          bg:        '#050816',
          'bg-2':    '#0a0f2e',
          primary:   '#0EA5E9',
          secondary: '#6366F1',
          accent:    '#22D3EE',
          danger:    '#EF4444',
          success:   '#22C55E',
          warning:   '#F59E0B',
          muted:     '#94A3B8',
          border:    'rgba(255,255,255,0.08)',
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #050816 0%, #0a0f2e 50%, #050816 100%)',
        'hero-gradient':  'radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.15) 0%, rgba(99,102,241,0.1) 40%, transparent 70%)',
        'card-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
        'accent-gradient':  'linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%)',
        'danger-gradient':  'linear-gradient(135deg, #EF4444 0%, #7F1D1D 100%)',
        'success-gradient': 'linear-gradient(135deg, #22C55E 0%, #14532D 100%)',
        'glow-primary': 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)',
        'glow-secondary': 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
      },
      animation: {
        'float':         'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow-pulse':    'glow-pulse 3s ease-in-out infinite',
        'scan-line':     'scan-line 2s linear infinite',
        'shimmer':       'shimmer 2.5s linear infinite',
        'spin-slow':     'spin 8s linear infinite',
        'spin-reverse':  'spin-reverse 12s linear infinite',
        'pulse-glow':    'pulse-glow 2s ease-in-out infinite',
        'grid-move':     'grid-move 20s linear infinite',
        'fade-in-up':    'fade-in-up 0.6s ease-out',
        'fade-in':       'fade-in 0.5s ease-out',
        'slide-in-right':'slide-in-right 0.5s ease-out',
        'bounce-slow':   'bounce 3s infinite',
        'type-cursor':   'type-cursor 1s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%':      { opacity: '0.8', filter: 'blur(25px)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(14,165,233,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(14,165,233,0.6), 0 0 80px rgba(14,165,233,0.2)' },
        },
        'grid-move': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'type-cursor': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      boxShadow: {
        'glow-primary':   '0 0 20px rgba(14,165,233,0.4), 0 0 60px rgba(14,165,233,0.1)',
        'glow-secondary': '0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.1)',
        'glow-accent':    '0 0 20px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.1)',
        'glow-danger':    '0 0 20px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.1)',
        'glow-success':   '0 0 20px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.1)',
        'glass':          '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':           '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':     '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(14,165,233,0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
