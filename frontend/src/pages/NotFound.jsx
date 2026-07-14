import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(interval); navigate('/'); }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      </div>

      <div className="relative z-10">
        {/* Glitch 404 */}
        <motion.div
          animate={{ x: [-1, 1, -1, 0], skewX: [-0.5, 0.5, 0] }}
          transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
          className="mb-4"
        >
          <span className="font-grotesk font-black text-[8rem] md:text-[12rem] leading-none gradient-text text-glow-secondary select-none">
            404
          </span>
        </motion.div>

        {/* Shield icon */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
          className="flex justify-center mb-6"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 0 24px rgba(99,102,241,0.25)' }}>
            <Shield size={28} style={{ color: '#6366F1' }} />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-grotesk font-bold text-2xl md:text-3xl text-white mb-3"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-phish-muted text-base mb-4 max-w-sm mx-auto"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-phish-muted text-sm mb-8 font-inter"
        >
          Redirecting to home in{' '}
          <span className="font-bold text-phish-primary">{count}s</span>
        </motion.p>

        {/* Progress bar */}
        <div className="w-48 mx-auto h-1 rounded-full mb-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0EA5E9, #6366F1)' }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-grotesk font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}>
            <Home size={16} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-grotesk font-medium text-phish-muted hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
