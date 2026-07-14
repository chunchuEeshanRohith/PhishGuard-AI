import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId || !password) {
      toast.error('Please enter Admin ID and Password');
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    if (adminId === 'admin' && password === 'PhishGuard@2026') {
      sessionStorage.setItem(
        'phishguard_admin_session',
        JSON.stringify({
          authenticated: true,
          loginTime: new Date().toISOString()
        })
      );
      toast.success('Admin authentication successful');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#050816' }}>
      
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-phish-primary/10"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 20 + i * 10, repeat: Infinity, ease: 'linear' }}
            style={{ width: `${600 + i * 200}px`, height: `${600 + i * 200}px` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md z-10"
      >
        <div className="rounded-3xl p-8 overflow-hidden"
          style={{
            background: 'rgba(10,15,46,0.8)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(14,165,233,0.3)',
            boxShadow: '0 0 50px rgba(14,165,233,0.1)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 30px rgba(14,165,233,0.4)' }}>
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="font-grotesk font-bold text-2xl text-white tracking-tight mb-2">Admin Portal</h1>
            <p className="text-phish-muted text-sm">Secure Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-xs font-grotesk font-semibold text-phish-muted uppercase tracking-wider pl-1">Admin ID</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted" />
                <input
                  type="text"
                  value={adminId}
                  onChange={e => setAdminId(e.target.value)}
                  className="input-cyber pl-12 py-3.5 w-full"
                  placeholder="Enter Admin ID"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-grotesk font-semibold text-phish-muted uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-cyber pl-12 py-3.5 w-full"
                  placeholder="Enter Password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 mt-4 rounded-xl font-grotesk font-bold text-white transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 24px rgba(14,165,233,0.3)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
            
            <button
              type="button"
              onClick={() => { setAdminId(''); setPassword(''); }}
              className="mt-2 text-xs text-phish-muted hover:text-white transition-colors text-center"
            >
              Reset Fields
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
