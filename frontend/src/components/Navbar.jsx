import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, ChevronRight, ScanLine, Layers, Info, Mail, Zap, Brain } from 'lucide-react';

const navLinks = [
  { to: '/about',     label: 'About',     icon: Info     },
  { to: '/scanner',   label: 'Scanner',   icon: ScanLine },
  { to: '/models',    label: 'Models',    icon: Brain    },
  { to: '/forensics', label: 'Forensics', icon: Layers   },
  { to: '/contact',   label: 'Contact',   icon: Mail     },
];

export default function Navbar() {
  const [scrolled, setScrolled]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium font-grotesk transition-colors duration-200 py-1 ${
      isActive ? 'text-phish-primary' : 'text-phish-muted hover:text-white'
    }`;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(5,8,22,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="PhishGuard AI Home">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                boxShadow: '0 0 20px rgba(14,165,233,0.4)',
              }}
            >
              <Shield size={18} className="text-white" />
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ boxShadow: '0 0 30px rgba(14,165,233,0.7)' }}
              />
            </div>
            <div className="leading-none">
              <span className="font-grotesk font-bold text-base text-white tracking-tight">PhishGuard</span>
              <span className="font-grotesk font-bold text-base tracking-tight" style={{ color: '#0EA5E9' }}>&nbsp;AI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #0EA5E9, #6366F1)' }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side: CTA + mobile toggle */}
          <div className="flex items-center gap-3">

            {/* Scan URL CTA button — desktop only */}
            <Link
              to="/scanner"
              id="navbar-scan-cta"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-grotesk font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                boxShadow: '0 0 18px rgba(14,165,233,0.35)',
              }}
            >
              <Zap size={14} />
              Scan URL
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X size={18} className="text-white" />
                : <Menu size={18} className="text-phish-muted" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(5,8,22,0.72)', backdropFilter: 'blur(4px)' }}
            />

            {/* Slide-in drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden flex flex-col"
              style={{
                background: 'rgba(5,8,22,0.98)',
                backdropFilter: 'blur(30px)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between p-5 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}
                  >
                    <Shield size={14} className="text-white" />
                  </div>
                  <span className="font-grotesk font-bold text-white text-sm">PhishGuard AI</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <X size={16} className="text-phish-muted" />
                </button>
              </div>

              {/* Nav links with icons */}
              <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.1 }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-grotesk font-medium transition-all ${
                            isActive
                              ? 'text-phish-primary'
                              : 'text-phish-muted hover:text-white'
                          }`
                        }
                        style={({ isActive }) =>
                          isActive
                            ? { background: 'rgba(14,165,233,0.10)', border: '1px solid rgba(14,165,233,0.20)' }
                            : {}
                        }
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={15} />
                          {link.label}
                        </span>
                        <ChevronRight size={14} className="opacity-40" />
                      </NavLink>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile scan CTA pinned to bottom */}
              <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Link
                  to="/scanner"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-grotesk font-semibold text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                    boxShadow: '0 0 20px rgba(14,165,233,0.3)',
                  }}
                >
                  <Zap size={15} />
                  Scan a URL Now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div className="h-16" />
    </>
  );
}
