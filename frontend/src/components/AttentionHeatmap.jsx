import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Info, Eye, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AttentionHeatmap({ attentionData, prediction, threatScore, url }) {
  const [activeToken, setActiveToken] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'high_only'

  if (!attentionData || !attentionData.tokens || attentionData.tokens.length === 0) {
    return null;
  }

  const { tokens, peak_char, peak_weight, peak_intensity, suspicious_segments } = attentionData;
  const isPhishing = prediction === 'Phishing';

  // Helper to determine styling based on normalized intensity (0.0 to 1.0)
  const getIntensityStyles = (intensity) => {
    if (intensity >= 0.75) {
      return {
        bg: 'rgba(239, 68, 68, 0.35)',
        border: 'rgba(239, 68, 68, 0.6)',
        text: '#FECDD3',
        shadow: '0 0 12px rgba(239, 68, 68, 0.45)',
        scale: 1.05,
      };
    }
    if (intensity >= 0.5) {
      return {
        bg: 'rgba(245, 158, 11, 0.25)',
        border: 'rgba(245, 158, 11, 0.45)',
        text: '#FDE68A',
        shadow: '0 0 8px rgba(245, 158, 11, 0.25)',
        scale: 1.02,
      };
    }
    if (intensity >= 0.25) {
      return {
        bg: 'rgba(14, 165, 233, 0.18)',
        border: 'rgba(14, 165, 233, 0.35)',
        text: '#BAE6FD',
        shadow: 'none',
        scale: 1.0,
      };
    }
    return {
      bg: 'rgba(30, 41, 59, 0.4)',
      border: 'rgba(255, 255, 255, 0.06)',
      text: '#94A3B8',
      shadow: 'none',
      scale: 1.0,
    };
  };

  const displayedTokens = filterMode === 'high_only'
    ? tokens.filter(t => t.intensity >= 0.5)
    : tokens;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #0EA5E9)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.35)',
            }}
          >
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-grotesk font-bold text-white text-base">
                Explainable AI: Attention Saliency Heatmap
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                XAI Neural Map
              </span>
            </div>
            <p className="text-phish-muted text-xs">
              Character-level Self-Attention weights computed by the BiLSTM encoder
            </p>
          </div>
        </div>

        {/* View Mode Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-grotesk font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-phish-primary/20 text-white border border-phish-primary/40'
                : 'text-phish-muted hover:text-white'
            }`}
          >
            Full Sequence
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('high_only')}
            className={`px-3 py-1 rounded-lg text-xs font-grotesk font-medium transition-all ${
              filterMode === 'high_only'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-phish-muted hover:text-white'
            }`}
          >
            High Focus Only
          </button>
        </div>
      </div>

      {/* Interactive URL Characters Heatmap */}
      <div className="p-4 rounded-xl bg-black/30 border border-white/5 mb-4">
        <p className="text-[11px] font-grotesk uppercase tracking-wider text-phish-muted mb-3 flex items-center justify-between">
          <span>Character Sequence Attention</span>
          <span className="text-[10px] lowercase text-slate-400 font-sans">hover any token for saliency metrics</span>
        </p>

        <div className="flex flex-wrap gap-1.5 font-mono text-sm select-none">
          {displayedTokens.map((t) => {
            const styles = getIntensityStyles(t.intensity);
            const isHovered = activeToken?.index === t.index;

            return (
              <motion.span
                key={t.index}
                whileHover={{ scale: 1.25, zIndex: 30 }}
                onMouseEnter={() => setActiveToken(t)}
                onMouseLeave={() => setActiveToken(null)}
                className="relative inline-flex items-center justify-center w-7 h-8 rounded-lg cursor-pointer transition-colors duration-150 font-bold"
                style={{
                  background: styles.bg,
                  border: `1px solid ${isHovered ? '#FFFFFF' : styles.border}`,
                  color: isHovered ? '#FFFFFF' : styles.text,
                  boxShadow: isHovered ? '0 0 16px rgba(255,255,255,0.6)' : styles.shadow,
                }}
              >
                {t.char}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Tooltip / Active Token Metrics Box */}
      <div className="min-h-[48px] p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-wrap items-center justify-between gap-3 text-xs">
        {activeToken ? (
          <>
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center font-mono font-bold text-white text-sm">
                {activeToken.char}
              </span>
              <div>
                <span className="text-white font-medium">Position #{activeToken.index + 1}</span>
                <span className="text-phish-muted ml-2">({activeToken.tag})</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-phish-muted font-mono">
              <div>
                <span>Raw Attention: </span>
                <strong className="text-phish-primary">{activeToken.weight.toFixed(5)}</strong>
              </div>
              <div>
                <span>Saliency Intensity: </span>
                <strong
                  style={{
                    color: activeToken.intensity >= 0.7 ? '#F87171' : activeToken.intensity >= 0.4 ? '#FBBF24' : '#38BDF8',
                  }}
                >
                  {(activeToken.intensity * 100).toFixed(1)}%
                </strong>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-phish-muted italic">
            <Eye size={14} className="text-phish-primary shrink-0" />
            <span>Hover over any character token above to inspect its real attention probability from the LSTM layer.</span>
          </div>
        )}
      </div>

      {/* Saliency Legend & Segments */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] text-xs">
        {/* Thermal Legend */}
        <div>
          <span className="text-phish-muted uppercase text-[10px] font-grotesk tracking-wider block mb-2">
            Attention Scale
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Baseline (0%)</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden flex" style={{ background: '#0F172A' }}>
              <div className="w-1/4 h-full bg-slate-700/60" />
              <div className="w-1/4 h-full bg-sky-500/60" />
              <div className="w-1/4 h-full bg-amber-500/70" />
              <div className="w-1/4 h-full bg-rose-500/90" />
            </div>
            <span className="text-[11px] text-rose-400 font-semibold">Peak Saliency (100%)</span>
          </div>
        </div>

        {/* Peak & Suspicious Patterns */}
        <div>
          <span className="text-phish-muted uppercase text-[10px] font-grotesk tracking-wider block mb-2">
            Model Focus Highlights
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[11px]">
              Peak Token: <strong>'{peak_char}'</strong> ({((peak_intensity || 0) * 100).toFixed(0)}%)
            </span>
            {suspicious_segments && suspicious_segments.length > 0 && (
              suspicious_segments.map((seg, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono text-[11px]"
                >
                  Cluster: <strong>{seg}</strong>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
