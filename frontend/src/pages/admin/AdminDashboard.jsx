import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Activity, Target, Zap, Clock, ShieldX } from 'lucide-react';
import { historyService } from '../../services/historyService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    legitimate: 0,
    suspicious: 0,
    phishing: 0,
    avgThreat: 0,
    avgConf: 0,
    highestThreat: 0,
    today: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const history = await historyService.getHistory();
      if (!history.length) return;

      const legitimate = history.filter(h => h.prediction.toLowerCase() === 'legitimate').length;
      const suspicious = history.filter(h => h.prediction.toLowerCase() === 'suspicious').length;
      const phishing = history.filter(h => h.prediction.toLowerCase() === 'phishing').length;
      
      const totalThreat = history.reduce((sum, h) => sum + (h.threat_score || 0), 0);
      const totalConf = history.reduce((sum, h) => sum + (h.confidence || 0), 0);
      const highestThreat = Math.max(...history.map(h => h.threat_score || 0));
      
      const today = new Date().toISOString().split('T')[0];
      const todayCount = history.filter(h => h.scan_time.startsWith(today)).length;

      setStats({
        total: history.length,
        legitimate,
        suspicious,
        phishing,
        avgThreat: (totalThreat / history.length).toFixed(1),
        avgConf: (totalConf / history.length).toFixed(1),
        highestThreat,
        today: todayCount,
      });
    };
    loadStats();
  }, []);

  const cards = [
    { title: "Total Scans", value: stats.total, icon: Activity, color: "#0EA5E9" },
    { title: "Today's Scans", value: stats.today, icon: Clock, color: "#8B5CF6" },
    { title: "Legitimate", value: stats.legitimate, icon: ShieldCheck, color: "#22C55E" },
    { title: "Suspicious", value: stats.suspicious, icon: ShieldAlert, color: "#EAB308" },
    { title: "Phishing", value: stats.phishing, icon: ShieldX, color: "#EF4444" },
    { title: "Avg Threat Score", value: stats.avgThreat, icon: Target, color: stats.avgThreat > 50 ? "#EF4444" : "#22C55E" },
    { title: "Avg Confidence", value: `${stats.avgConf}%`, icon: Zap, color: "#0EA5E9" },
    { title: "Highest Threat", value: stats.highestThreat, icon: Shield, color: "#EF4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-grotesk font-bold text-white">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <card.icon size={48} color={card.color} />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${card.color}20`, border: `1px solid ${card.color}40` }}>
                <card.icon size={20} color={card.color} />
              </div>
              <div>
                <p className="text-phish-muted text-xs font-inter font-medium uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-2xl font-grotesk font-bold text-white leading-none">{card.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
