import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Shield, AlertTriangle, AlertCircle, Info, Globe, Lock,
  ArrowRight, RefreshCw, Copy, ExternalLink, CheckCircle, XCircle,
  ChevronDown, ChevronUp, Layers, Database, Wifi, GitBranch, Zap,
  Clock, Hash
} from 'lucide-react';

const API_BASE = 'http://localhost:5005';

const SEVERITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', label: 'CRITICAL', icon: XCircle },
  high:     { color: '#F97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.30)', label: 'HIGH',     icon: AlertTriangle },
  medium:   { color: '#EAB308', bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  label: 'MEDIUM',   icon: AlertCircle },
  low:      { color: '#6366F1', bg: 'rgba(99,102,241,0.10)', border: 'rgba(99,102,241,0.30)', label: 'LOW',      icon: Info },
};

const VERDICT_CONFIG = {
  'Critical Risk': { color: '#EF4444', glow: 'rgba(239,68,68,0.3)',  bg: 'rgba(239,68,68,0.1)',  icon: XCircle },
  'High Risk':     { color: '#F97316', glow: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.1)', icon: AlertTriangle },
  'Moderate Risk': { color: '#EAB308', glow: 'rgba(234,179,8,0.3)',  bg: 'rgba(234,179,8,0.1)',  icon: AlertCircle },
  'Low Risk':      { color: '#22C55E', glow: 'rgba(34,197,94,0.3)',  bg: 'rgba(34,197,94,0.1)',  icon: CheckCircle },
};

function SectionCard({ title, icon: Icon, iconColor = '#0EA5E9', children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,15,46,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}18` }}>
            <Icon size={16} style={{ color: iconColor }} />
          </div>
          <span className="font-grotesk font-semibold text-white text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-phish-muted" /> : <ChevronDown size={16} className="text-phish-muted" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-6 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DataRow({ label, value, mono = false, valueColor }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="text-phish-muted text-xs shrink-0">{label}</span>
      <span className={`text-xs text-right break-all ${mono ? 'font-mono' : 'font-medium'}`}
        style={{ color: valueColor || '#e2e8f0' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function Badge({ text, color = '#0EA5E9' }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold mr-1 mb-1"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
      {text}
    </span>
  );
}

function RiskIndicatorCard({ indicator }) {
  const cfg = SEVERITY_CONFIG[indicator.severity] || SEVERITY_CONFIG.low;
  const SevIcon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl p-4 flex items-start gap-3"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <SevIcon size={16} style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-white">{indicator.label}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
        </div>
        {indicator.detail && (
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>{indicator.detail}</p>
        )}
        <p className="text-[10px] mt-1" style={{ color: cfg.color + '99' }}>{indicator.category}</p>
      </div>
    </motion.div>
  );
}

function RedirectChain({ chain }) {
  if (!chain || chain.length === 0) return <p className="text-phish-muted text-xs">No redirect data available.</p>;
  return (
    <div className="space-y-2">
      {chain.map((hop, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background: hop.is_redirect ? 'rgba(234,179,8,0.15)' : 'rgba(34,197,94,0.15)',
                color: hop.is_redirect ? '#EAB308' : '#22C55E',
                border: `1px solid ${hop.is_redirect ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`,
              }}>
              {i + 1}
            </div>
            {i < chain.length - 1 && (
              <div className="w-px h-6 mt-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
          <div className="flex-1 min-w-0 pb-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                style={{ background: hop.protocol === 'HTTPS' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: hop.protocol === 'HTTPS' ? '#22C55E' : '#EF4444' }}>
                {hop.protocol}
              </span>
              {hop.status_code && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8' }}>
                  {hop.status_code}
                </span>
              )}
              {hop.is_redirect && (
                <span className="text-[10px]" style={{ color: '#EAB308' }}>→ Redirect</span>
              )}
            </div>
            <p className="text-xs text-white break-all font-mono leading-relaxed">{hop.url}</p>
            {hop.error && <p className="text-[11px] mt-1" style={{ color: '#EF4444' }}>{hop.error}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreRing({ score, verdict }) {
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG['Low Risk'];
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10"
            stroke="rgba(255,255,255,0.06)" />
          <motion.circle
            cx="64" cy="64" r={r} fill="none" strokeWidth="10"
            stroke={cfg.color}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-grotesk" style={{ color: cfg.color }}>{score}</span>
          <span className="text-[9px] text-phish-muted uppercase tracking-widest">Risk Score</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="font-grotesk font-bold text-sm" style={{ color: cfg.color }}>{verdict}</span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 mt-6 animate-pulse">
      {[200, 160, 280, 200].map((w, i) => (
        <div key={i} className="rounded-2xl p-6 shimmer" style={{ height: w, background: 'rgba(255,255,255,0.03)' }} />
      ))}
    </div>
  );
}

export default function Forensics() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${API_BASE}/api/forensics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (err) {
      setError(err.message || 'Forensics analysis failed. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const copyText = (text) => navigator.clipboard.writeText(text).catch(() => {});

  const verdict = data ? (VERDICT_CONFIG[data.forensic_verdict] || VERDICT_CONFIG['Low Risk']) : null;

  return (
    <div className="section min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(14,165,233,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.06) 0%, transparent 60%), #050816' }}>
      <div className="container-lg">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}>
            <Layers size={13} className="text-phish-primary" />
            <span className="text-xs font-grotesk text-phish-primary tracking-wider">DEEP FORENSICS ENGINE</span>
          </div>
          <h1 className="font-grotesk font-bold text-4xl md:text-5xl text-white mb-3">
            URL Deep <span className="gradient-text">Forensics</span>
          </h1>
          <p className="text-phish-muted text-sm md:text-base max-w-xl mx-auto">
            Multi-layer forensic dissection — DNS records, SSL certificates, redirect chains, and structural risk indicators.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 mb-8"
          style={{ background: 'rgba(10,15,46,0.8)', border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 0 40px rgba(14,165,233,0.07)' }}>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted pointer-events-none" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter URL to analyze — e.g. https://suspicious-login.xyz/paypal/verify"
                className="input-cyber pl-11 pr-4"
                disabled={loading}
                id="forensics-url-input"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary px-6 py-3 flex items-center gap-2 shrink-0 rounded-xl"
              id="forensics-analyze-btn"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Analyzing…' : 'Analyze'}
            </motion.button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <XCircle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Results */}
        {data && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Top summary bar */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(10,15,46,0.9)', border: `1px solid ${verdict?.border || 'rgba(255,255,255,0.08)'}`,
                boxShadow: `0 0 40px ${verdict?.glow || 'transparent'}` }}>
              <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
                <ScoreRing score={data.forensic_risk_score} verdict={data.forensic_verdict} />

                <div>
                  <p className="text-phish-muted text-xs uppercase tracking-widest mb-2">Analyzed URL</p>
                  <div className="flex items-start gap-2 mb-4">
                    <p className="font-mono text-sm text-white break-all flex-1">{data.url}</p>
                    <button onClick={() => copyText(data.url)} className="shrink-0 mt-0.5 text-phish-muted hover:text-white transition-colors">
                      <Copy size={13} />
                    </button>
                    <a href={data.cleaned_url} target="_blank" rel="noopener noreferrer" className="shrink-0 mt-0.5 text-phish-muted hover:text-phish-primary transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  {/* Severity summary pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: `${data.critical_count} Critical`, sev: 'critical', count: data.critical_count },
                      { label: `${data.high_count} High`,     sev: 'high',     count: data.high_count },
                      { label: `${data.medium_count} Medium`, sev: 'medium',   count: data.medium_count },
                      { label: `${data.low_count} Low`,       sev: 'low',      count: data.low_count },
                    ].map(({ label, sev, count }) => {
                      const c = SEVERITY_CONFIG[sev];
                      return count > 0 ? (
                        <span key={sev} className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                          {label}
                        </span>
                      ) : null;
                    })}
                    {data.indicator_count === 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                        ✓ No indicators found
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right hidden md:block">
                  <p className="text-phish-muted text-[10px] uppercase tracking-widest mb-1">Analyzed At</p>
                  <p className="text-white text-xs font-mono">{new Date(data.analyzed_at).toLocaleString()}</p>
                  <p className="text-phish-muted text-[10px] mt-2">{data.indicator_count} indicator{data.indicator_count !== 1 ? 's' : ''} detected</p>
                </div>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 gap-5">

              {/* Risk Indicators */}
              <div className="lg:col-span-2">
                <SectionCard title="Risk Indicators" icon={AlertTriangle} iconColor="#F97316">
                  {data.risk_indicators.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle size={18} style={{ color: '#22C55E' }} />
                      <p className="text-sm" style={{ color: '#22C55E' }}>No risk indicators triggered. URL appears structurally clean.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      {data.risk_indicators.map((ind, i) => (
                        <RiskIndicatorCard key={i} indicator={ind} />
                      ))}
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* URL Anatomy */}
              <SectionCard title="URL Anatomy" icon={Hash} iconColor="#6366F1">
                <div className="mt-2">
                  {/* Visual URL breakdown */}
                  <div className="rounded-xl p-3 mb-4 font-mono text-xs flex flex-wrap gap-1 items-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Badge text={data.anatomy.scheme + "://"} color="#22C55E" />
                    {data.anatomy.subdomains.map((s, i) => <Badge key={i} text={s + "."} color="#6366F1" />)}
                    <Badge text={data.anatomy.domain} color="#0EA5E9" />
                    {data.anatomy.path && <Badge text={data.anatomy.path} color="#94A3B8" />}
                    {data.anatomy.query_param_count > 0 && <Badge text={`?${data.anatomy.query_param_count} params`} color="#EAB308" />}
                    {data.anatomy.fragment && <Badge text={`#${data.anatomy.fragment}`} color="#EC4899" />}
                  </div>
                  <DataRow label="Scheme" value={data.anatomy.scheme.toUpperCase()} valueColor={data.anatomy.scheme === 'https' ? '#22C55E' : '#EF4444'} />
                  <DataRow label="Host" value={data.anatomy.host} mono />
                  <DataRow label="Domain" value={data.anatomy.domain} mono />
                  <DataRow label="TLD" value={`.${data.anatomy.tld}`} mono />
                  <DataRow label="Subdomains" value={data.anatomy.subdomains.length > 0 ? data.anatomy.subdomains.join(', ') : 'None'} mono />
                  <DataRow label="Path Depth" value={`${data.anatomy.path_depth} segment${data.anatomy.path_depth !== 1 ? 's' : ''}`} />
                  <DataRow label="Query Params" value={data.anatomy.query_param_count} />
                  <DataRow label="Total Length" value={`${data.anatomy.total_length} chars`} />
                  <DataRow label="Host Entropy" value={`${data.anatomy.host_entropy} bits`}
                    valueColor={data.anatomy.host_entropy > 4.2 ? '#EF4444' : data.anatomy.host_entropy > 3.5 ? '#EAB308' : '#22C55E'} />
                  <DataRow label="Hyphens in Domain" value={data.anatomy.hyphen_count}
                    valueColor={data.anatomy.hyphen_count >= 3 ? '#F97316' : '#e2e8f0'} />
                  <DataRow label="IP as Host" value={data.anatomy.has_ip_host ? '⚠ Yes' : '✓ No'}
                    valueColor={data.anatomy.has_ip_host ? '#EF4444' : '#22C55E'} />
                  <DataRow label="@ Symbol" value={data.anatomy.has_at_symbol ? '⚠ Yes' : '✓ No'}
                    valueColor={data.anatomy.has_at_symbol ? '#EF4444' : '#22C55E'} />
                  {data.anatomy.path_extension && (
                    <DataRow label="Path Extension" value={data.anatomy.path_extension} mono
                      valueColor={data.anatomy.has_suspicious_extension ? '#EF4444' : '#e2e8f0'} />
                  )}
                  {Object.keys(data.anatomy.query_params).length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-2">Query Parameters</p>
                      {Object.entries(data.anatomy.query_params).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2 mb-1">
                          <span className="text-[11px] font-mono text-phish-primary shrink-0">{k}=</span>
                          <span className="text-[11px] font-mono text-white break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* DNS */}
              <SectionCard title="DNS Resolution" icon={Database} iconColor="#22D3EE">
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: data.dns.resolved ? '#22C55E' : '#EF4444' }} />
                    <span className="text-sm font-semibold" style={{ color: data.dns.resolved ? '#22C55E' : '#EF4444' }}>
                      {data.dns.resolved ? 'Domain Resolves Successfully' : 'Domain Does Not Resolve'}
                    </span>
                  </div>
                  {data.dns.error && (
                    <div className="rounded-lg p-3 mb-3 text-xs"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {data.dns.error}
                    </div>
                  )}
                  {data.dns.ipv4.length > 0 && (
                    <div className="mb-3">
                      <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-2">IPv4 Addresses</p>
                      {data.dns.ipv4.map((ip, i) => (
                        <span key={i} className="inline-block mr-2 mb-1 text-xs font-mono px-2 py-1 rounded"
                          style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
                          {ip}
                        </span>
                      ))}
                    </div>
                  )}
                  {data.dns.ipv6.length > 0 && (
                    <div className="mb-3">
                      <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-2">IPv6 Addresses</p>
                      {data.dns.ipv6.slice(0, 2).map((ip, i) => (
                        <p key={i} className="text-xs font-mono text-white break-all">{ip}</p>
                      ))}
                    </div>
                  )}
                  <DataRow label="Reverse DNS" value={data.dns.reverse_dns || 'No PTR record'} mono />
                </div>
              </SectionCard>

              {/* SSL */}
              <SectionCard title="SSL / TLS Certificate" icon={Lock} iconColor="#22C55E">
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: data.ssl.has_ssl ? '#22C55E' : '#EF4444' }} />
                    <span className="text-sm font-semibold" style={{ color: data.ssl.has_ssl ? '#22C55E' : '#EF4444' }}>
                      {data.ssl.has_ssl ? 'HTTPS Enabled' : 'No SSL/HTTPS Detected'}
                    </span>
                  </div>
                  {data.ssl.error && (
                    <div className="rounded-lg p-3 mb-3 text-xs"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {data.ssl.error}
                    </div>
                  )}
                  {data.ssl.has_ssl && <>
                    <DataRow label="Protocol" value={data.ssl.protocol} mono />
                    <DataRow label="Issuer" value={data.ssl.issuer} />
                    <DataRow label="Subject / CN" value={data.ssl.subject} mono />
                    <DataRow label="Valid From" value={data.ssl.valid_from} mono />
                    <DataRow label="Valid To" value={data.ssl.valid_to} mono
                      valueColor={data.ssl.is_expired ? '#EF4444' : data.ssl.days_remaining < 30 ? '#EAB308' : '#22C55E'} />
                    <DataRow label="Days Remaining"
                      value={data.ssl.days_remaining !== null ? `${data.ssl.days_remaining} days` : '—'}
                      valueColor={data.ssl.days_remaining < 7 ? '#EF4444' : data.ssl.days_remaining < 30 ? '#EAB308' : '#22C55E'} />
                    <DataRow label="Self-Signed" value={data.ssl.is_self_signed ? '⚠ Yes' : '✓ No'}
                      valueColor={data.ssl.is_self_signed ? '#EF4444' : '#22C55E'} />
                    <DataRow label="Expired" value={data.ssl.is_expired ? '⚠ Yes' : '✓ No'}
                      valueColor={data.ssl.is_expired ? '#EF4444' : '#22C55E'} />
                    {data.ssl.san_domains.length > 0 && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-2">Subject Alternative Names ({data.ssl.san_domains.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {data.ssl.san_domains.slice(0, 12).map((d, i) => (
                            <Badge key={i} text={d} color="#0EA5E9" />
                          ))}
                          {data.ssl.san_domains.length > 12 && (
                            <Badge text={`+${data.ssl.san_domains.length - 12} more`} color="#94A3B8" />
                          )}
                        </div>
                      </div>
                    )}
                  </>}
                </div>
              </SectionCard>

              {/* Redirect Chain */}
              <div className="lg:col-span-2">
                <SectionCard title="Redirect Chain Analysis" icon={GitBranch} iconColor="#6366F1">
                  <div className="mt-2">
                    <div className="flex items-center gap-4 mb-5 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <GitBranch size={13} className="text-phish-muted" />
                        <span className="text-xs text-white">{data.redirects.total_hops} redirect hop{data.redirects.total_hops !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{ background: data.redirects.has_http_to_https_upgrade ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                          border: data.redirects.has_http_to_https_upgrade ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.07)' }}>
                        <ArrowRight size={13} style={{ color: data.redirects.has_http_to_https_upgrade ? '#22C55E' : '#94A3B8' }} />
                        <span className="text-xs" style={{ color: data.redirects.has_http_to_https_upgrade ? '#22C55E' : '#94A3B8' }}>
                          {data.redirects.has_http_to_https_upgrade ? 'HTTP → HTTPS Upgrade' : 'No HTTP→HTTPS upgrade'}
                        </span>
                      </div>
                    </div>
                    <RedirectChain chain={data.redirects.chain} />
                    {data.redirects.error && (
                      <p className="text-xs mt-3 px-3 py-2 rounded-lg"
                        style={{ color: '#EAB308', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
                        ⚠ {data.redirects.error}
                      </p>
                    )}
                  </div>
                </SectionCard>
              </div>

            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !data && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
              <Layers size={36} className="text-phish-primary opacity-60" />
            </div>
            <h3 className="font-grotesk font-semibold text-white text-lg mb-2">Ready for Forensic Analysis</h3>
            <p className="text-phish-muted text-sm max-w-sm mx-auto">
              Enter any URL above to run a full deep forensic inspection — DNS, SSL, redirects, structural risk, and more.
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { icon: Database,   label: 'DNS Resolution',     desc: 'IPv4, IPv6, reverse PTR' },
                { icon: Lock,       label: 'SSL/TLS Analysis',   desc: 'Cert validity, issuer, SANs' },
                { icon: GitBranch,  label: 'Redirect Tracing',   desc: 'Full hop-by-hop chain' },
                { icon: Zap,        label: 'Risk Indicators',    desc: 'Weighted multi-category scoring' },
              ].map(({ icon: I, label, desc }) => (
                <div key={label} className="rounded-xl p-4 text-left"
                  style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <I size={18} className="text-phish-primary mb-2" />
                  <p className="text-white text-xs font-semibold mb-1">{label}</p>
                  <p className="text-phish-muted text-[11px]">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
