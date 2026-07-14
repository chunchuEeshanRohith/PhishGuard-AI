import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const [email, setEmail]       = useState('admin@phishguard.ai');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useApp();
  const navigate                = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login(email);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)', filter: 'blur(30px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(10,15,46,0.8)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(14,165,233,0.2)',
            boxShadow: '0 0 60px rgba(14,165,233,0.08)',
          }}
        >
          {/* Header gradient bar */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #0EA5E9, #6366F1, #22D3EE)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ boxShadow: ['0 0 20px rgba(14,165,233,0.3)', '0 0 40px rgba(14,165,233,0.6)', '0 0 20px rgba(14,165,233,0.3)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}
              >
                <Shield size={28} className="text-white" />
              </motion.div>
              <h1 className="font-grotesk font-bold text-2xl text-white mb-1">Welcome Back</h1>
              <p className="text-phish-muted text-sm">Sign in to your PhishGuard AI account</p>
            </div>

            {/* Demo hint */}
            <div className="mb-6 p-3.5 rounded-xl text-xs font-grotesk"
              style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', color: '#0EA5E9' }}>
              <span className="font-semibold">Demo credentials pre-filled.</span> Just click Login to proceed.
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-grotesk font-medium text-phish-muted mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted group-focus-within:text-phish-primary transition-colors" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@phishguard.ai"
                    className="input-cyber pl-11 py-3.5 text-sm"
                    style={{ borderRadius: '0.875rem' }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-grotesk font-medium text-phish-muted mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted group-focus-within:text-phish-primary transition-colors" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-cyber pl-11 pr-11 py-3.5 text-sm"
                    style={{ borderRadius: '0.875rem' }}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-phish-muted hover:text-white transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-phish-danger text-xs font-grotesk">{error}</p>
              )}

              {/* Remember me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-phish-muted cursor-pointer">
                  <input type="checkbox" className="rounded" style={{ accentColor: '#0EA5E9' }} defaultChecked />
                  Remember me
                </label>
                <a href="#" className="text-phish-primary hover:underline font-grotesk">Forgot password?</a>
              </div>

              {/* Login button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { y: -2, boxShadow: '0 0 40px rgba(14,165,233,0.5)' } : {}}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-grotesk font-bold text-base text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Login to Dashboard
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-phish-muted text-xs">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <Link to="/detect"
              className="w-full py-3 rounded-xl text-sm font-grotesk font-semibold text-phish-muted border border-white/10 hover:border-phish-primary/40 hover:text-phish-primary transition-all flex items-center justify-center gap-2">
              <Shield size={15} />
              Continue without login
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-phish-muted mt-5 font-inter">
          © 2025 PhishGuard AI · Academic Project
        </p>
      </motion.div>
    </div>
  );
}
