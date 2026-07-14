import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ShieldX, ArrowLeft, RotateCcw, Copy, ExternalLink, Info, Clock, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ConfidenceRing from '../components/ConfidenceRing';
import StatusBadge from '../components/StatusBadge';
import GlowCard from '../components/GlowCard';

export default function Result() {
  const { scanResult } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!scanResult) navigate('/detect');
  }, [scanResult, navigate]);

  if (!scanResult) return null;

  const pred = scanResult.prediction;
  
  let color = '#22C55E';
  let glow = 'rgba(34,197,94,0.25)';
  let cardColor = 'success';
  let statusBadgeType = 'safe';
  let Icon = ShieldCheck;
  let title = 'Safe Website';

  if (pred === 'Suspicious') {
    color = '#EAB308';
    glow = 'rgba(234,179,8,0.25)';
    cardColor = 'warning';
    statusBadgeType = 'warning';
    Icon = AlertTriangle;
    title = 'Suspicious Activity';
  } else if (pred === 'Phishing') {
    color = '#EF4444';
    glow = 'rgba(239,68,68,0.25)';
    cardColor = 'danger';
    statusBadgeType = 'danger';
    Icon = ShieldX;
    title = 'Phishing Detected!';
  }

  const copyURL = () => navigator.clipboard.writeText(scanResult.url).catch(() => {});

  return (
    <div className="section">
      <div className="container-lg">
        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <button onClick={() => navigate('/detect')}
            className="inline-flex items-center gap-2 text-sm text-phish-muted hover:text-white transition-colors font-grotesk">
            <ArrowLeft size={16} />
            Back to Scanner
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main result card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2"
          >
            <GlowCard color={cardColor} className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], boxShadow: [`0 0 20px ${glow}`, `0 0 40px ${glow}`, `0 0 20px ${glow}`] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    <Icon size={26} style={{ color }} />
                  </motion.div>
                  <div>
                    <p className="text-phish-muted text-xs uppercase tracking-widest font-grotesk mb-1">Scan Result</p>
                    <h2 className="font-grotesk font-bold text-3xl" style={{ color }}>
                      {title}
                    </h2>
                  </div>
                </div>
                <StatusBadge status={statusBadgeType} size="lg" />
              </div>

              {/* URL */}
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-phish-muted text-xs uppercase tracking-wider mb-2 font-grotesk">Scanned URL</p>
                <div className="flex items-center gap-2">
                  <p className="font-inter text-sm text-white break-all flex-1">{scanResult.url}</p>
                  <button onClick={copyURL} className="shrink-0 text-phish-muted hover:text-phish-primary transition-colors" title="Copy URL">
                    <Copy size={14} />
                  </button>
                  <a href={scanResult.url} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 text-phish-muted hover:text-phish-primary transition-colors" title="Open URL">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Scan ID & timestamp */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Shield size={16} className="text-phish-muted" />
                  <div>
                    <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-0.5">Risk Level</p>
                    <p className="font-inter text-xs font-semibold text-white">{scanResult.risk_level}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Clock size={16} className="text-phish-muted" />
                  <div>
                    <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-0.5">Scanned At</p>
                    <p className="font-inter text-xs text-white">{new Date(scanResult.scan_time).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Reasons & Recommendations */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={15} style={{ color }} />
                    <h3 className="font-grotesk font-semibold text-white text-sm">Key Observations</h3>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {scanResult.reasons.map((reason, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                        className="flex items-start gap-3 text-sm text-phish-muted"
                      >
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color }} />
                        {reason}
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={15} style={{ color }} />
                    <h3 className="font-grotesk font-semibold text-white text-sm">Recommendation</h3>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-phish-muted">
                     <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color }} />
                     {scanResult.recommendation}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Link to="/detect"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-grotesk font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}
                >
                  <RotateCcw size={15} />
                  Scan Another URL
                </Link>
                <Link to="/history"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-grotesk font-medium text-phish-muted hover:text-white transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  View History
                </Link>
              </div>
            </GlowCard>
          </motion.div>

          {/* Side panel */}
          <div className="flex flex-col gap-6">
            {/* Confidence ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'backOut' }}
              className="rounded-2xl p-6 flex flex-col items-center text-center"
              style={{ background: 'rgba(10,15,46,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="font-grotesk font-semibold text-white mb-5 text-sm">AI Confidence</p>
              <ConfidenceRing value={scanResult.confidence} status={statusBadgeType} size={160} />
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-phish-muted">Threat Score</span>
                  <span className="font-medium" style={{ color }}>{scanResult.threat_score} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${scanResult.threat_score}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Model Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(10,15,46,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <h3 className="font-grotesk font-semibold text-white text-sm mb-4">Processing Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted text-xs">Model Used</span>
                  <span className="text-white text-xs font-medium">{scanResult.model} {scanResult.model_version}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted text-xs">Features Analyzed</span>
                  <span className="text-white text-xs font-medium">{scanResult.features_analyzed}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted text-xs">Processing Time</span>
                  <span className="text-white text-xs font-medium">{scanResult.processing_time_ms} ms</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted text-xs">Request ID</span>
                  <span className="text-white text-[10px] font-mono">{scanResult.request_id}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
