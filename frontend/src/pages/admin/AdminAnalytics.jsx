import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { historyService } from '../../services/historyService';

const COLORS = {
  legitimate: '#22C55E',
  suspicious: '#EAB308',
  phishing: '#EF4444',
  low: '#3B82F6',
  medium: '#EAB308',
  high: '#F97316',
  critical: '#EF4444'
};

export default function AdminAnalytics() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    historyService.getHistory().then(setHistory);
  }, []);

  // Prepare data for Pie Chart (Predictions)
  const predictionData = useMemo(() => {
    const counts = history.reduce((acc, curr) => {
      const pred = curr.prediction.toLowerCase();
      acc[pred] = (acc[pred] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Legitimate', value: counts['legitimate'] || 0, color: COLORS.legitimate },
      { name: 'Suspicious', value: counts['suspicious'] || 0, color: COLORS.suspicious },
      { name: 'Phishing', value: counts['phishing'] || 0, color: COLORS.phishing },
    ].filter(d => d.value > 0);
  }, [history]);

  // Prepare data for Doughnut Chart (Risk Levels)
  const riskData = useMemo(() => {
    const counts = history.reduce((acc, curr) => {
      const risk = curr.risk_level.toLowerCase();
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { name: 'Low', value: counts['low'] || 0, color: COLORS.low },
      { name: 'Medium', value: counts['medium'] || 0, color: COLORS.medium },
      { name: 'High', value: counts['high'] || 0, color: COLORS.high },
      { name: 'Critical', value: counts['critical'] || 0, color: COLORS.critical },
    ].filter(d => d.value > 0);
  }, [history]);

  // Prepare data for Bar Chart (Daily Scans)
  const dailyData = useMemo(() => {
    const groups = history.reduce((acc, curr) => {
      const date = curr.scan_time.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Sort by date and take last 7 days
    return Object.entries(groups)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([date, count]) => ({
        date: date.substring(5), // MM-DD
        scans: count
      }));
  }, [history]);

  // Prepare data for Line Chart (Threat Trend)
  const trendData = useMemo(() => {
    // Sort chronologically
    const sorted = [...history].sort((a, b) => new Date(a.scan_time) - new Date(b.scan_time)).slice(-20); // Last 20 scans
    return sorted.map((h, i) => ({
      index: i + 1,
      score: h.threat_score
    }));
  }, [history]);

  if (!history.length) {
    return <div className="text-center py-20 text-phish-muted">Not enough data to generate analytics.</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-phish-bg/95 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white text-xs font-bold mb-1">{label || payload[0].name}</p>
          <p className="text-xs" style={{ color: payload[0].payload.color || payload[0].color }}>
            Value: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-grotesk font-bold text-white mb-6">Analytics Engine</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Predictions Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-grotesk font-semibold text-white mb-4">Prediction Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={predictionData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value" stroke="rgba(10,15,46,1)">
                  {predictionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {predictionData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-phish-muted">
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </div>
            ))}
          </div>
        </motion.div>

        {/* Risk Doughnut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-grotesk font-semibold text-white mb-4">Risk Levels Analysis</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="rgba(10,15,46,1)">
                  {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-2">
            {riskData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-phish-muted">
                <span className="w-3 h-3 rounded-full" style={{ background: d.color }} /> {d.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Scans Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 lg:col-span-2" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-grotesk font-semibold text-white mb-6">Daily Scan Activity (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="scans" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Threat Trend Line */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 lg:col-span-2" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-grotesk font-semibold text-white mb-6">Threat Score Trend (Last 20 Scans)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="index" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 3, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
