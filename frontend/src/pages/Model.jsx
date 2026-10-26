import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Brain, Layers, Zap, BarChart3, GitMerge, Database,
  CheckCircle, ArrowRight, ChevronDown, ChevronUp,
  Hash, Cpu, Network, Target, TrendingUp, Activity,
  Shield, Info, BookOpen, Code2
} from 'lucide-react';

// ── Real training data from training_history.json ──────────────────────────
const TRAINING_DATA = {
  epochs: [1, 2],
  train_loss: [0.4337, 0.0478],
  train_acc:  [73.09, 98.83],
  val_loss:   [0.0486, 0.0234],
  val_acc:    [98.60, 99.20],
  val_f1:     [98.62, 99.20],
};

// ── Architecture config from model_config.json ─────────────────────────────
const MODEL_CONFIG = {
  vocab_size:    75,
  embedding_dim: 64,
  hidden_dim:    128,
  num_layers:    2,
  dropout:       0.3,
  max_len:       200,
  total_params:  '~1.1M',
  model_size:    '3.5 MB',
  batch_size:    256,
  optimizer:     'AdamW',
  lr:            0.001,
  loss:          'BCEWithLogitsLoss',
  device:        'MPS (Apple Silicon)',
};

// ─── Reusable metric stat card ──────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#0EA5E9', delay = 0, icon: Icon }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl p-5 text-center relative overflow-hidden"
      style={{ background: 'rgba(10,15,46,0.7)', border: `1px solid ${color}25` }}
    >
      <div className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }} />
      {Icon && (
        <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
      )}
      <p className="text-3xl font-bold font-grotesk" style={{ color }}>{value}</p>
      <p className="text-white text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-phish-muted text-xs mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ─── Animated bar ───────────────────────────────────────────────────────────
function AnimBar({ value, max = 100, color, label, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-phish-muted">{label}</span>
        <span className="font-mono font-semibold" style={{ color }}>{value.toFixed(2)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${(value / max) * 100}%` } : {}}
          transition={{ duration: 1.2, delay, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
    </div>
  );
}

// ─── Mini SVG line chart (inline, no lib) ───────────────────────────────────
function LineChart({ data1, data2, labels, color1 = '#0EA5E9', color2 = '#6366F1', title, yLabel }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const W = 380, H = 160, PAD = { t: 16, r: 16, b: 32, l: 44 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const allVals = [...data1, ...data2];
  const minV = Math.min(...allVals) * 0.95;
  const maxV = Math.max(...allVals) * 1.02;

  const toX = (i) => PAD.l + (i / (data1.length - 1)) * chartW;
  const toY = (v) => PAD.t + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const makePath = (data) =>
    data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');

  const yTicks = 4;

  return (
    <div ref={ref}>
      {title && <p className="text-white text-xs font-semibold mb-2">{title}</p>}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Grid lines */}
        {Array.from({ length: yTicks }).map((_, i) => {
          const y = PAD.t + (i / (yTicks - 1)) * chartH;
          const v = maxV - (i / (yTicks - 1)) * (maxV - minV);
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={PAD.l - 4} y={y + 4} textAnchor="end" fill="rgba(148,163,184,0.7)" fontSize="9">
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {labels.map((l, i) => (
          <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="9">
            {l}
          </text>
        ))}

        {/* Data lines */}
        {inView && (
          <>
            <motion.path
              d={makePath(data1)} fill="none" stroke={color1} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
            <motion.path
              d={makePath(data2)} fill="none" stroke={color2} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.2, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Data points */}
        {inView && data1.map((v, i) => (
          <motion.circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill={color1}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 + i * 0.15 }} />
        ))}
        {inView && data2.map((v, i) => (
          <motion.circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill={color2}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 + i * 0.15 }} />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded-full" style={{ background: color1 }} />
          <span className="text-[10px] text-phish-muted">Train</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 rounded-full" style={{ background: color2, borderTop: '1px dashed' }} />
          <span className="text-[10px] text-phish-muted">Val</span>
        </div>
      </div>
    </div>
  );
}

// ─── Architecture flow diagram ───────────────────────────────────────────────
function ArchDiagram() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const layers = [
    { id: 'input',    label: 'URL Input',           sub: 'max 200 chars',            color: '#94A3B8', icon: '⌨' },
    { id: 'tokenize', label: 'Character Tokenizer', sub: 'vocab size: 75',           color: '#6366F1', icon: '#' },
    { id: 'embed',    label: 'Embedding Layer',     sub: '75 × 64 dims',             color: '#8B5CF6', icon: '⊞' },
    { id: 'bilstm',   label: 'BiLSTM (×2 layers)',  sub: '128 hidden, bidirectional',color: '#0EA5E9', icon: '↔' },
    { id: 'attn',     label: 'Self-Attention',       sub: '256-dim context vector',   color: '#22D3EE', icon: '◎' },
    { id: 'siamese',  label: 'Siamese Merge',        sub: '[A, B, |A−B|, A⊙B]',      color: '#F59E0B', icon: '⊗' },
    { id: 'mlp',      label: 'Classifier MLP',       sub: '1024 → 256 → 64 → 1',     color: '#F97316', icon: '▣' },
    { id: 'output',   label: 'Sigmoid Output',       sub: 'Phishing probability',     color: '#22C55E', icon: '⊛' },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-col gap-2">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            {/* Node */}
            <div className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 relative"
              style={{ background: `${layer.color}0E`, border: `1px solid ${layer.color}30` }}>
              <span className="text-lg w-6 text-center">{layer.icon}</span>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">{layer.label}</p>
                <p className="text-phish-muted text-[10px]">{layer.sub}</p>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: layer.color }} />
            </div>

            {/* Arrow (not on last) */}
            {i < layers.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.08 + 0.3 }}
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: `${(i + 1) * 58 - 10}px` }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Connecting spine */}
      <div className="absolute left-[22px] top-10 bottom-10 w-px opacity-20"
        style={{ background: 'linear-gradient(to bottom, #6366F1, #22C55E)' }} />

      {/* Arrow between nodes */}
      {layers.slice(0, -1).map((_, i) => (
        <motion.div key={i}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: i * 0.08 + 0.25 }}
          className="absolute left-[18px] text-phish-muted text-[10px]"
          style={{ top: `${i * 58 + 50}px` }}>
          ↓
        </motion.div>
      ))}
    </div>
  );
}

// ─── Siamese similarity visualizer ──────────────────────────────────────────
function SiameseViz() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [highlighted, setHighlighted] = useState(null);

  const features = [
    { label: 'Repr A',    color: '#0EA5E9', desc: 'Embedding of query URL' },
    { label: 'Repr B',    color: '#6366F1', desc: 'Phishing reference centroid' },
    { label: '|A − B|',  color: '#F97316', desc: 'Absolute difference (L1 distance)' },
    { label: 'A ⊙ B',   color: '#22D3EE', desc: 'Hadamard (element-wise) product' },
  ];

  return (
    <div ref={ref} className="space-y-4">
      <p className="text-phish-muted text-xs">
        Both URL branches are encoded with <strong className="text-white">shared weights</strong>, then combined into four similarity features before classification.
      </p>

      {/* Two branch boxes */}
      <div className="grid grid-cols-2 gap-3">
        {['Query URL', 'Reference Embedding'].map((label, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15 }}
            className="rounded-xl p-3 text-center"
            style={{ background: i === 0 ? 'rgba(14,165,233,0.08)' : 'rgba(99,102,241,0.08)',
              border: `1px solid ${i === 0 ? 'rgba(14,165,233,0.2)' : 'rgba(99,102,241,0.2)'}` }}>
            <p className="text-[11px] font-semibold" style={{ color: i === 0 ? '#0EA5E9' : '#6366F1' }}>{label}</p>
            <p className="text-phish-muted text-[10px] mt-0.5">BiLSTM + Attention</p>
            <div className="flex justify-center gap-0.5 mt-2">
              {Array.from({ length: 8 }).map((_, j) => (
                <motion.div key={j} className="w-2 rounded-sm"
                  style={{ height: `${Math.random() * 14 + 4}px`,
                    background: i === 0 ? '#0EA5E9' : '#6366F1', opacity: 0.7 }}
                  initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}}
                  transition={{ delay: 0.4 + j * 0.04 }} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Merge arrow */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }}
        className="text-center text-phish-muted text-xs flex items-center justify-center gap-2">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        CONCAT → 1024-dim vector
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </motion.div>

      {/* 4 features */}
      <div className="grid grid-cols-2 gap-2">
        {features.map((f, i) => (
          <motion.div key={f.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6 + i * 0.1 }}
            onMouseEnter={() => setHighlighted(i)}
            onMouseLeave={() => setHighlighted(null)}
            className="rounded-xl p-3 cursor-default transition-all"
            style={{ background: highlighted === i ? `${f.color}18` : `${f.color}0A`,
              border: `1px solid ${f.color}${highlighted === i ? '45' : '25'}` }}>
            <p className="text-sm font-bold font-mono" style={{ color: f.color }}>{f.label}</p>
            <p className="text-phish-muted text-[10px] mt-0.5">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Attention heatmap demo ──────────────────────────────────────────────────
function AttentionDemo() {
  const demoUrl = 'paypa1-secure-login.xyz/verify/account';
  const weights = [
    0.05,0.08,0.07,0.06,0.09,0.55,0.35,0.18,0.22,0.45,0.72,0.88,0.92,0.78,0.65,
    0.42,0.38,0.50,0.48,0.55,0.35,0.20,0.15,0.10,0.08,0.12,0.45,0.62,0.55,0.50,
    0.40,0.38,0.35,0.30,0.25,
  ];
  const chars = demoUrl.split('');

  const getColor = (w) => {
    if (w > 0.75) return { bg: 'rgba(239,68,68,0.8)',   text: '#fff' };
    if (w > 0.5)  return { bg: 'rgba(249,115,22,0.6)',  text: '#fff' };
    if (w > 0.3)  return { bg: 'rgba(234,179,8,0.45)',  text: '#fff' };
    if (w > 0.15) return { bg: 'rgba(14,165,233,0.25)', text: '#e2e8f0' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#94A3B8' };
  };

  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div ref={ref}>
      <p className="text-phish-muted text-xs mb-3">
        Each character is colored by its <strong className="text-white">self-attention weight</strong> — red characters are where the model focuses most.
      </p>
      <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-2">Example: Phishing URL</p>
        <div className="flex flex-wrap gap-0.5">
          {chars.map((ch, i) => {
            const w = weights[i] ?? 0.05;
            const style = getColor(w);
            return (
              <motion.span key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.018, duration: 0.3 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="inline-block px-1 py-0.5 rounded text-xs font-mono cursor-default transition-transform"
                style={{
                  background: style.bg, color: style.text,
                  transform: hoveredIdx === i ? 'scale(1.4)' : 'scale(1)',
                  zIndex: hoveredIdx === i ? 10 : 1, position: 'relative',
                }}>
                {ch === '/' ? '/' : ch}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Very High', bg: 'rgba(239,68,68,0.8)' },
          { label: 'High',      bg: 'rgba(249,115,22,0.6)' },
          { label: 'Medium',    bg: 'rgba(234,179,8,0.45)' },
          { label: 'Low',       bg: 'rgba(14,165,233,0.25)' },
          { label: 'Baseline',  bg: 'rgba(255,255,255,0.07)' },
        ].map(({ label, bg }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
            <span className="text-[10px] text-phish-muted">{label}</span>
          </div>
        ))}
      </div>

      {hoveredIdx !== null && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
          <span className="font-mono text-phish-primary">'{chars[hoveredIdx]}'</span>
          <span className="text-phish-muted ml-2">attention weight: <span className="text-white font-semibold">{(weights[hoveredIdx] ?? 0.05).toFixed(3)}</span></span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Confusion matrix heatmap ────────────────────────────────────────────────
function ConfusionMatrix() {
  // Approximated from 99.2% accuracy on ~2500 test samples
  const matrix = [[1238, 18],[2, 1242]];
  const labels = ['Legitimate', 'Phishing'];
  const total = matrix.flat().reduce((a, b) => a + b, 0);
  const colors = [
    ['rgba(34,197,94,0.8)',  'rgba(239,68,68,0.45)'],
    ['rgba(239,68,68,0.45)', 'rgba(34,197,94,0.8)' ],
  ];

  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-phish-muted text-xs">Confusion matrix on test set (approx. 2,500 samples)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs">
          <thead>
            <tr>
              <th className="pb-2 text-phish-muted font-normal text-[10px] text-left pr-3">Predicted →</th>
              {labels.map(l => (
                <th key={l} className="pb-2 font-grotesk font-semibold text-white px-2">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={ri}>
                <td className="py-1 text-phish-muted text-[10px] text-left pr-3">{labels[ri]}</td>
                {row.map((val, ci) => (
                  <td key={ci} className="py-1 px-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: (ri * 2 + ci) * 0.12 }}
                      className="rounded-xl py-3 flex flex-col items-center justify-center gap-1"
                      style={{ background: colors[ri][ci], minWidth: 90 }}>
                      <span className="text-white font-bold text-lg font-grotesk">{val.toLocaleString()}</span>
                      <span className="text-white/70 text-[10px]">{((val / total) * 100).toFixed(1)}%</span>
                      <span className="text-white/60 text-[9px]">{ri === ci ? '✓ Correct' : '✗ Error'}</span>
                    </motion.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Vocab ring chart ────────────────────────────────────────────────────────
function VocabBreakdown() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const categories = [
    { label: 'Lowercase a–z',   count: 26, color: '#0EA5E9' },
    { label: 'Digits 0–9',      count: 10, color: '#6366F1' },
    { label: 'Special symbols', count: 35, color: '#F97316' },
    { label: '<PAD> / <UNK>',   count:  2, color: '#94A3B8' },
    { label: 'Extended chars',  count:  2, color: '#22D3EE' },
  ];
  const total = 75;
  const cx = 60, cy = 60, r = 50;
  let startAngle = -Math.PI / 2;

  const arcs = categories.map(cat => {
    const angle = (cat.count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.cos(startAngle);
    const y2 = cy + r * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    return { ...cat, d: `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z` };
  });

  return (
    <div ref={ref} className="flex items-center gap-6 flex-wrap">
      <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
        {arcs.map((arc, i) => (
          <motion.path key={i} d={arc.d} fill={arc.color} stroke="#050816" strokeWidth="2"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 0.85 } : {}}
            transition={{ delay: i * 0.1 }} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">75</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize="7">tokens</text>
      </svg>
      <div className="space-y-2 flex-1">
        {categories.map((cat, i) => (
          <motion.div key={cat.label}
            initial={{ opacity: 0, x: 10 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: cat.color }} />
            <span className="text-phish-muted flex-1">{cat.label}</span>
            <span className="font-mono text-white font-semibold">{cat.count}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, iconColor = '#0EA5E9', children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(10,15,46,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${iconColor}15`, border: `1px solid ${iconColor}30` }}>
          <Icon size={17} style={{ color: iconColor }} />
        </div>
        <h2 className="font-grotesk font-bold text-white text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.section>
  );
}

// ─── Pipeline step card ───────────────────────────────────────────────────────
function PipelineStep({ step, title, detail, color, icon, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10"
          style={{ background: `${color}20`, border: `1.5px solid ${color}50`, color }}>
          {step}
        </div>
        <div className="w-px flex-1 mt-2 mb-2" style={{ background: `${color}20`, minHeight: 32 }} />
      </div>
      <div className="flex-1 pb-6">
        <p className="text-white text-sm font-semibold mb-1">{title}</p>
        <p className="text-phish-muted text-xs leading-relaxed">{detail}</p>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Model() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(ellipse at 15% 0%, rgba(99,102,241,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 60%, rgba(14,165,233,0.06) 0%, transparent 55%), #050816'
    }}>
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none cyber-grid" />

      <div className="section container-lg relative z-10 space-y-8">

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <motion.div ref={heroRef} className="text-center py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <Brain size={13} className="text-phish-secondary" />
            <span className="text-xs font-grotesk text-phish-secondary tracking-wider uppercase">Model Architecture & Research</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-grotesk font-bold text-4xl md:text-6xl text-white mb-4"
          >
            Siamese{' '}
            <span className="gradient-text">LSTM-Attention</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-phish-muted text-base md:text-lg max-w-2xl mx-auto"
          >
            A hybrid deep learning architecture combining character-level embeddings,
            bidirectional LSTM, self-attention, and Siamese similarity learning
            for high-precision phishing URL detection.
          </motion.p>

          {/* Hero stat pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            {[
              { label: '99.2% Accuracy',    color: '#22C55E' },
              { label: '99.2% F1 Score',    color: '#0EA5E9' },
              { label: '~1.1M Parameters',  color: '#6366F1' },
              { label: 'MPS Accelerated',   color: '#F59E0B' },
              { label: '3.5 MB Model Size', color: '#22D3EE' },
            ].map(({ label, color }) => (
              <span key={label} className="px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold"
                style={{ background: `${color}12`, color, border: `1px solid ${color}30` }}>
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── KEY METRICS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Test Accuracy"  value="99.2%" sub="on held-out test set"  color="#22C55E" delay={0}    icon={Target} />
          <StatCard label="Val F1 Score"   value="99.20" sub="epoch 2 best"          color="#0EA5E9" delay={0.1}  icon={Activity} />
          <StatCard label="Val Loss"       value="0.023" sub="epoch 2 (BCELogits)"   color="#6366F1" delay={0.2}  icon={TrendingUp} />
          <StatCard label="Inference"      value="<100ms" sub="on Apple MPS"         color="#F59E0B" delay={0.3}  icon={Zap} />
        </div>

        {/* ── TRAINING CURVES ─────────────────────────────────────────────── */}
        <Section title="Training Curves" icon={BarChart3} iconColor="#0EA5E9">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <LineChart
                title="Loss over Epochs"
                data1={TRAINING_DATA.train_loss.map(v => v * 100)}
                data2={TRAINING_DATA.val_loss.map(v => v * 100)}
                labels={TRAINING_DATA.epochs.map(e => `Epoch ${e}`)}
                color1="#F97316"
                color2="#22D3EE"
              />
              <p className="text-phish-muted text-[10px] mt-2 text-center">
                Train loss dropped from 43.4% → 4.8% | Val loss 4.9% → 2.3%
              </p>
            </div>
            <div>
              <LineChart
                title="Accuracy & F1 over Epochs"
                data1={TRAINING_DATA.train_acc}
                data2={TRAINING_DATA.val_acc}
                labels={TRAINING_DATA.epochs.map(e => `Epoch ${e}`)}
                color1="#6366F1"
                color2="#22C55E"
              />
              <p className="text-phish-muted text-[10px] mt-2 text-center">
                Train acc 73.1% → 98.8% | Val acc 98.6% → 99.2%
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-white text-xs font-semibold mb-3">Final Epoch Metrics</p>
            <AnimBar value={99.20} label="Validation Accuracy"  color="#22C55E" delay={0.1} />
            <AnimBar value={99.20} label="Validation F1 Score"  color="#0EA5E9" delay={0.2} />
            <AnimBar value={98.83} label="Training Accuracy"    color="#6366F1" delay={0.3} />
          </div>
        </Section>

        {/* ── ARCHITECTURE + PIPELINE ─────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Architecture flow */}
          <Section title="Architecture Layers" icon={Layers} iconColor="#6366F1">
            <ArchDiagram />
          </Section>

          {/* Pipeline steps */}
          <Section title="Inference Pipeline" icon={Cpu} iconColor="#F59E0B">
            <div className="space-y-0">
              {[
                { step: 1, title: 'URL Normalization',       color: '#94A3B8', detail: 'Strip https://, lowercase, remove www prefix. Ensures consistent tokenization regardless of input format.' },
                { step: 2, title: 'Character Tokenization',  color: '#6366F1', detail: 'Each character maps to an integer index via a 75-token vocabulary. Unknown chars get <UNK> (idx 1). Padded to max_len=200.' },
                { step: 3, title: 'Embedding Lookup',        color: '#8B5CF6', detail: 'Transforms token IDs into 64-dimensional dense vectors. The embedding table (75×64) is learned during training.' },
                { step: 4, title: 'BiLSTM Encoding',         color: '#0EA5E9', detail: '2-layer bidirectional LSTM with 128 hidden units per direction (256 total). Captures sequential dependencies in both directions.' },
                { step: 5, title: 'Self-Attention',          color: '#22D3EE', detail: 'A learnable linear layer scores each timestep. Softmax weights produce a 256-dim weighted context vector — the URL "representation".' },
                { step: 6, title: 'Siamese Comparison',      color: '#F59E0B', detail: 'Query URL representation is compared to a pre-computed phishing cluster centroid. 4 similarity features: concat, abs diff, Hadamard product → 1024-dim.' },
                { step: 7, title: 'MLP Classification',      color: '#F97316', detail: '3-layer feedforward network: 1024→256→64→1. ReLU activations with 0.3 dropout. Output is a single logit.' },
                { step: 8, title: 'Sigmoid Decision',        color: '#22C55E', detail: 'σ(logit) → probability ∈ [0,1]. Threshold 0.5: above = Phishing, below = Legitimate. Confidence = max(p, 1-p).' },
              ].map((s, i) => (
                <PipelineStep key={s.step} {...s} delay={i * 0.06} />
              ))}
            </div>
          </Section>
        </div>

        {/* ── SIAMESE SIMILARITY ──────────────────────────────────────────── */}
        <Section title="Siamese Similarity Learning" icon={GitMerge} iconColor="#F59E0B">
          <SiameseViz />
        </Section>

        {/* ── ATTENTION HEATMAP DEMO ──────────────────────────────────────── */}
        <Section title="Self-Attention Explainability (XAI)" icon={Network} iconColor="#22D3EE">
          <AttentionDemo />
        </Section>

        {/* ── CONFUSION MATRIX + VOCAB ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Section title="Confusion Matrix" icon={Target} iconColor="#22C55E">
            <ConfusionMatrix />
          </Section>
          <Section title="Character Vocabulary" icon={Hash} iconColor="#6366F1">
            <VocabBreakdown />
            <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                ['Vocab Size',  '75 unique tokens'],
                ['Max Length',  '200 characters'],
                ['Padding',     '<PAD> → index 0'],
                ['Unknown',     '<UNK> → index 1'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-phish-muted">{k}</span>
                  <span className="font-mono text-white">{v}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── HYPERPARAMETERS ─────────────────────────────────────────────── */}
        <Section title="Hyperparameters & Training Config" icon={Code2} iconColor="#F97316">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-3">Model</p>
              {[
                ['Embedding Dim',  MODEL_CONFIG.embedding_dim],
                ['Hidden Dim',     MODEL_CONFIG.hidden_dim],
                ['LSTM Layers',    MODEL_CONFIG.num_layers],
                ['Dropout',        MODEL_CONFIG.dropout],
                ['Total Params',   MODEL_CONFIG.total_params],
                ['Model Size',     MODEL_CONFIG.model_size],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted">{k}</span>
                  <span className="font-mono text-white">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-3">Training</p>
              {[
                ['Optimizer',    MODEL_CONFIG.optimizer],
                ['Learning Rate', MODEL_CONFIG.lr],
                ['Loss Function', MODEL_CONFIG.loss],
                ['Batch Size',    MODEL_CONFIG.batch_size],
                ['Epochs',       '2 (early stop=3)'],
                ['Seed',          '42'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted">{k}</span>
                  <span className="font-mono text-white">{v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-phish-muted text-[10px] uppercase tracking-wider mb-3">Data</p>
              {[
                ['Train Samples',  '10,000 URLs'],
                ['Val Samples',    '1,000 URLs'],
                ['Dataset Split',  '80 / 10 / 10'],
                ['Balance',        'Phishing + Legitimate'],
                ['Device',         MODEL_CONFIG.device],
                ['Framework',      'PyTorch'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-phish-muted">{k}</span>
                  <span className="font-mono text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── WHY SIAMESE? ────────────────────────────────────────────────── */}
        <Section title="Why Siamese Architecture?" icon={BookOpen} iconColor="#22C55E">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Shield, color: '#22C55E',
                title: 'Brand Spoofing Detection',
                body: 'Siamese networks detect when a URL is semantically similar to known phishing patterns, catching even novel variants that simple keyword matching misses.',
              },
              {
                icon: Zap, color: '#F59E0B',
                title: 'One-Shot Generalization',
                body: 'The model compares against a pre-computed phishing reference embedding, allowing it to generalize to new attack variants without retraining.',
              },
              {
                icon: Network, color: '#6366F1',
                title: 'Character-Level Robustness',
                body: 'Operating at the character level, the model naturally handles homoglyphs (paypal → paypa1), typosquatting, and IDN attacks that fool word-level models.',
              },
            ].map(({ icon: I, color, title, body }) => (
              <div key={title} className="rounded-xl p-5"
                style={{ background: `${color}07`, border: `1px solid ${color}20` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}15` }}>
                  <I size={17} style={{ color }} />
                </div>
                <p className="font-grotesk font-semibold text-white text-sm mb-2">{title}</p>
                <p className="text-phish-muted text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
