import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Brain,
  Activity,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function ThreatConsensus({ consensusData, prediction }) {
  if (!consensusData || !consensusData.engines || consensusData.engines.length === 0) {
    return null;
  }

  const {
    consensus_score,
    consensus_verdict,
    agreement_label,
    agreement_level,
    engines_flagged,
    total_engines,
    is_zero_day,
    engines,
  } = consensusData;

  const isPhishing = consensus_verdict === 'Phishing' || prediction === 'Phishing';
  const isSuspicious = consensus_verdict === 'Suspicious' || prediction === 'Suspicious';

  const getVerdictBadge = (verdict) => {
    const v = (verdict || '').toLowerCase();
    if (v === 'phishing') {
      return {
        bg: 'bg-rose-500/15',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        dot: 'bg-rose-400',
        label: 'Phishing',
      };
    }
    if (v === 'suspicious') {
      return {
        bg: 'bg-amber-500/15',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        label: 'Suspicious',
      };
    }
    return {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'Clean / Safe',
    };
  };

  const getEngineIcon = (name) => {
    if (name.includes('Siamese') || name.includes('Attention')) return Brain;
    if (name.includes('Lexical') || name.includes('Entropy')) return Activity;
    if (name.includes('Brand') || name.includes('Homoglyph')) return Sparkles;
    return Layers;
  };

  return (
    <div
      className="rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 mt-6"
      style={{
        background: 'rgba(10, 15, 46, 0.75)',
        border: '1px solid rgba(14, 165, 233, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)',
            }}
          >
            {isPhishing ? (
              <ShieldX size={20} className="text-white" />
            ) : isSuspicious ? (
              <ShieldAlert size={20} className="text-white" />
            ) : (
              <ShieldCheck size={20} className="text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-grotesk font-bold text-white text-base">
                Multi-Engine Threat Consensus
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                4-Layer Consensus
              </span>
            </div>
            <p className="text-phish-muted text-xs">
              Simultaneous cross-validation across 4 distinct detection architectures
            </p>
          </div>
        </div>

        {/* Consensus Verdict Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-grotesk text-phish-muted tracking-wider block">
              Consensus Score
            </span>
            <span
              className={`font-mono font-bold text-base ${
                consensus_score >= 65
                  ? 'text-rose-400'
                  : consensus_score >= 35
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {consensus_score}/100
            </span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-grotesk font-bold flex items-center gap-2 ${
              isPhishing
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : isSuspicious
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isPhishing ? 'bg-rose-400' : isSuspicious ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span>{agreement_label}</span>
          </div>
        </div>
      </div>

      {/* Zero-Day Early Warning Banner (if detected) */}
      {is_zero_day && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(139, 92, 246, 0.15))',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.1)',
          }}
        >
          <Zap size={18} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-grotesk font-bold text-rose-300">
              Zero-Day Threat Discovered by Neural Engine
            </h4>
            <p className="text-slate-300 leading-relaxed">
              The Siamese-LSTM Attention model identified deceptive sequence anomalies despite traditional threat-intelligence lists showing no prior record. This demonstrates real-time protection against newly created phishing campaigns.
            </p>
          </div>
        </motion.div>
      )}

      {/* 4 Engine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map((engine, idx) => {
          const EngineIcon = getEngineIcon(engine.name);
          const badge = getVerdictBadge(engine.verdict);
          const scorePercent = Math.min(Math.max(engine.score || 0, 0), 100);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              className="p-4 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Engine Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}
                  >
                    <EngineIcon size={16} className="text-phish-primary" />
                  </div>
                  <div>
                    <h4 className="font-grotesk font-bold text-white text-xs leading-snug">
                      {engine.name}
                    </h4>
                    <span className="text-[10px] text-phish-muted">Layer #{idx + 1}</span>
                  </div>
                </div>

                <div
                  className={`px-2 py-0.5 rounded-full text-[10px] font-grotesk font-semibold flex items-center gap-1.5 border ${badge.bg} ${badge.border} ${badge.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  <span>{badge.label}</span>
                </div>
              </div>

              {/* Threat Score Bar */}
              <div className="mb-3 space-y-1">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-phish-muted">Engine Threat Score</span>
                  <span className={badge.text}>
                    {engine.score}/100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${scorePercent}%`,
                      background:
                        scorePercent >= 60
                          ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                          : scorePercent >= 30
                          ? 'linear-gradient(90deg, #0EA5E9, #F59E0B)'
                          : 'linear-gradient(90deg, #10B981, #0EA5E9)',
                    }}
                  />
                </div>
              </div>

              {/* Diagnostic Signals */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                {engine.signals && engine.signals.length > 0 ? (
                  engine.signals.map((signal, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <div
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          engine.verdict === 'Phishing'
                            ? 'bg-rose-400'
                            : engine.verdict === 'Suspicious'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="leading-tight">{signal}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-phish-muted italic">Nominal parameters</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
