import { Link } from 'react-router-dom';
import { Shield, ExternalLink, ArrowRight, Activity } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/scanner', label: 'URL Scanner' },
  { to: '/history', label: 'Scan History' },
  { to: '/about', label: 'About Project' },
  { to: '/contact', label: 'Contact Team' },
];

const platformLinks = [
  { to: '/models', label: 'Siamese-LSTM Network' },
  { to: '/forensics', label: 'Lexical Analysis Engine' },
  { to: '/admin/login', label: 'Admin Portal' },
];

export default function Footer() {
  return (
    <footer
      className="border-t py-12 mt-20 relative z-20"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(5,8,22,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Institution */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="PhishGuard AI Home">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}
              >
                <Shield size={16} className="text-white" />
              </div>
              <div className="leading-none">
                <span className="font-grotesk font-bold text-base text-white">PhishGuard</span>
                <span className="font-grotesk font-bold text-base text-phish-primary">&nbsp;AI</span>
              </div>
            </Link>
            <p className="text-phish-muted text-xs leading-relaxed">
              AI-Based Phishing Website Detection System powered by Siamese-LSTM deep learning architecture.
            </p>
            <div className="pt-1 text-xs text-phish-muted border-t border-white/[0.04]">
              <p className="font-medium text-slate-300">Anurag University</p>
              <p className="text-phish-muted">Department of Artificial Intelligence</p>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Inference Engine Live</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-grotesk font-semibold text-white text-sm mb-4 tracking-wide">Navigation</h4>
            <nav className="flex flex-col space-y-2.5" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-xs text-phish-muted hover:text-phish-primary transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight size={12} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all text-phish-primary" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="font-grotesk font-semibold text-white text-sm mb-4 tracking-wide">Platform & Security</h4>
            <nav className="flex flex-col space-y-2.5" aria-label="Footer platform links">
              {platformLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.to}
                  className="text-xs text-phish-muted hover:text-phish-primary transition-colors flex items-center gap-1.5 group"
                >
                  <ArrowRight size={12} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all text-phish-primary" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-3 border-t border-white/[0.04] text-[11px] text-phish-muted">
              <span>Model: Siamese-LSTM Attention v1.0</span>
            </div>
          </div>

          {/* Verified Development Team */}
          <div>
            <h4 className="font-grotesk font-semibold text-white text-sm mb-4 tracking-wide">Engineering Team</h4>
            <div className="space-y-3">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs font-semibold text-white">K. Keerthana</p>
                <p className="text-[11px] text-phish-muted">Machine Learning Engineer</p>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs font-semibold text-white">I. Sathwik</p>
                <p className="text-[11px] text-phish-muted">Backend Developer</p>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs font-semibold text-white">Ch. Eeshan Rohith</p>
                <p className="text-[11px] text-phish-muted">Frontend Developer & UI Designer</p>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Bottom copyright & attribution */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-phish-muted text-xs">© 2026 PhishGuard AI. All rights reserved.</p>
          <p className="text-phish-muted text-xs">
            Department of Artificial Intelligence • Anurag University
          </p>
        </div>
      </div>
    </footer>
  );
}

