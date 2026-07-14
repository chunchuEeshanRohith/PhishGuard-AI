import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shield, Zap, Brain, ChevronDown, CheckCircle, Search, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import TypeWriter from '../components/TypeWriter';
import FeatureCard from '../components/FeatureCard';
import SectionHeading from '../components/SectionHeading';
import CyberGlobe from '../components/three/CyberGlobe';
import { features, howItWorks } from '../utils/mockData';
import { predictUrl } from '../services/api';
import { useApp } from '../context/AppContext';
import { historyService } from '../services/historyService';

const examplePhishing = [
  'http://paypal-secure-login.phishsite.com',
  'http://bankofamerica-update.xyz/verify',
  'http://amazon-prize-winner.info/claim',
  'http://192.168.1.1/account/login',
  'http://microsoft-account-verify.tk/reset',
];

const exampleSafe = [
  'https://www.google.com',
  'https://github.com',
  'https://stripe.com/payment',
  'https://vercel.com/dashboard',
  'https://stackoverflow.com',
];

function ScanAnimation({ isScanning, url }) {
  if (!isScanning) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      style={{ background: 'rgba(5,8,22,0.95)', zIndex: 10 }}
    >
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #0EA5E9, transparent)' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative flex items-center justify-center mb-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{ borderColor: 'rgba(14,165,233,0.3)' }}
            animate={{ width: [60, 120 + i * 40], height: [60, 120 + i * 40], opacity: [0.8, 0] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="w-14 h-14 rounded-full flex items-center justify-center z-10"
          style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 30px rgba(14,165,233,0.5)' }}>
          <Shield size={24} className="text-white" />
        </div>
      </div>

      <p className="font-grotesk font-bold text-xl text-white mb-2">Analyzing website...</p>
      <p className="text-phish-muted text-sm font-inter truncate max-w-xs px-4 text-center">{url}</p>
    </motion.div>
  );
}

function HeroAndScanner() {
  const [url, setUrl] = useState('');
  const { isScanning, setIsScanning, setScanResult } = useApp();
  const navigate = useNavigate();

  const isValidURL = (str) => {
    try { new URL(str.startsWith('http') ? str : `https://${str}`); return true; }
    catch { return false; }
  };

  const handleScan = async (targetUrl) => {
    const scanTarget = (targetUrl || url).trim();
    if (!scanTarget) { toast.error('Please enter a URL to scan.'); return; }
    if (!isValidURL(scanTarget)) { toast.error('Please enter a valid URL (e.g., https://example.com).'); return; }

    setUrl(scanTarget);
    setIsScanning(true);

    try {
      const result = await predictUrl(scanTarget);
      const enrichedResult = { ...result, url: scanTarget };
      setScanResult(enrichedResult);
      
      // Automatically save to local storage history service without refresh
      await historyService.saveScan(enrichedResult);
      
      navigate('/result');
    } catch (err) {
      toast.error(err.message || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: '80vw', maxWidth: 900,
          height: '80vh',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
        }} />
      </div>

      <motion.div
        className="absolute top-16 right-8 md:right-16 opacity-20 md:opacity-30 pointer-events-none"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Shield size={80} className="text-phish-primary" strokeWidth={0.8} />
      </motion.div>

      <motion.div
        className="absolute bottom-24 left-8 md:left-16 opacity-20 pointer-events-none"
        animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <Brain size={60} className="text-phish-secondary" strokeWidth={0.8} />
      </motion.div>

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-grotesk font-bold text-5xl md:text-7xl leading-[1.08] tracking-tight mb-4 max-w-4xl"
      >
        <span className="text-white">AI-Based</span>{' '}
        <span className="gradient-text text-glow-primary">Phishing</span>
        <br />
        <span className="text-white">Website Detection</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-lg md:text-xl text-phish-muted max-w-2xl mb-4 leading-relaxed font-poppins"
      >
        Paste any website URL below to analyze whether it is Legitimate, Suspicious, or Phishing using Machine Learning.
      </motion.p>

      {/* Embedded Scanner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-3xl mx-auto mt-8"
      >
        <div className="relative rounded-2xl p-6 md:p-8 overflow-hidden text-left"
          style={{
            background: 'rgba(10,15,46,0.7)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(14,165,233,0.25)',
            boxShadow: '0 0 40px rgba(14,165,233,0.08)',
          }}
        >
          <AnimatePresence>
            <ScanAnimation isScanning={isScanning} url={url} />
          </AnimatePresence>

          <form onSubmit={e => { e.preventDefault(); handleScan(); }} className="flex flex-col gap-4">
            <div className="relative group">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted group-focus-within:text-phish-primary transition-colors" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://suspicious-site.com/login"
                className="input-cyber pl-12 pr-12 py-5 text-lg"
                style={{ borderRadius: '1rem' }}
                autoComplete="off"
                spellCheck={false}
                disabled={isScanning}
              />
              {url && (
                <button type="button" onClick={() => setUrl('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-phish-muted hover:text-white transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
            
            <motion.button
              type="submit"
              disabled={isScanning || !url.trim()}
              whileHover={!isScanning && url.trim() ? { y: -2, boxShadow: '0 0 50px rgba(14,165,233,0.6)' } : {}}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-xl font-grotesk font-bold text-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 24px rgba(14,165,233,0.3)' }}
            >
              <Zap size={20} />
              Analyze Website
              <ArrowRight size={18} />
            </motion.button>
          </form>

          {/* Example Links */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 mb-3"><AlertTriangle size={14} style={{ color: '#EF4444' }} /><span className="font-grotesk font-semibold text-xs" style={{ color: '#EF4444' }}>Phishing Examples</span></div>
              <div className="flex flex-col gap-1.5">{examplePhishing.slice(0,3).map((exUrl, i) => (<button key={i} onClick={() => handleScan(exUrl)} className="text-left text-xs font-inter truncate px-2 py-1.5 rounded transition-all hover:bg-red-500/10 text-phish-muted hover:text-red-400" disabled={isScanning}>{exUrl}</button>))}</div>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="flex items-center gap-2 mb-3"><CheckCircle size={14} style={{ color: '#22C55E' }} /><span className="font-grotesk font-semibold text-xs" style={{ color: '#22C55E' }}>Safe Examples</span></div>
              <div className="flex flex-col gap-1.5">{exampleSafe.slice(0,3).map((exUrl, i) => (<button key={i} onClick={() => handleScan(exUrl)} className="text-left text-xs font-inter truncate px-2 py-1.5 rounded transition-all hover:bg-green-500/10 text-phish-muted hover:text-green-400" disabled={isScanning}>{exUrl}</button>))}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function GlobeSection() {
  return (
    <section className="section relative overflow-hidden">
      <div className="container-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              badge="Global Threat Intelligence"
              title="Real-time threat"
              highlight="detection network"
              subtitle="Our AI monitors malicious URL patterns worldwide, analyzing millions of domains to keep you protected 24/7."
              center={false}
            />
            <div className="flex flex-col gap-4 mt-8">
              {['12 ML Features analyzed in real-time', 'Random Forest Model integration', 'Zero data retention — your privacy is guaranteed'].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-3 text-phish-muted text-sm"
                >
                  <CheckCircle size={16} className="text-phish-success shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <CyberGlobe height={420} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="section">
      <div className="container-xl">
        <SectionHeading
          badge="Capabilities"
          title="Everything you need to"
          highlight="stay protected"
          subtitle="Powered by machine learning, our platform delivers enterprise-grade security in a simple, accessible interface."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroAndScanner />
      <GlobeSection />
      <FeaturesSection />
    </div>
  );
}
