import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Code, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminSystem() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await api.get('/');
        setHealth({ status: 'online', details: response.data });
      } catch (err) {
        setHealth({ status: 'offline', details: null });
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealth();
    // Poll every 10 seconds
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-grotesk font-bold text-white mb-6">System Status</h1>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* API Core Status */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-phish-primary/10 border border-phish-primary/30">
              <Server size={24} className="text-phish-primary" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-lg text-white">Flask Backend</h2>
              <p className="text-xs text-phish-muted font-inter">Primary API Service</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <span className="text-sm text-phish-muted">Connection</span>
              {loading ? (
                <span className="text-sm text-phish-muted animate-pulse">Checking...</span>
              ) : health?.status === 'online' ? (
                <span className="flex items-center gap-2 text-sm text-phish-success font-medium">
                  <CheckCircle size={16} /> Online
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-red-500 font-medium">
                  <AlertTriangle size={16} /> Offline
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <span className="text-sm text-phish-muted">API Endpoint</span>
              <span className="text-sm text-white font-mono">{health?.details?.message || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* ML Model Status */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-500/10 border border-purple-500/30">
              <Code size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-lg text-white">Machine Learning</h2>
              <p className="text-xs text-phish-muted font-inter">Random Forest Engine</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <span className="text-sm text-phish-muted">Model Name</span>
              <span className="text-sm text-white font-medium">Random Forest Classifier</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <span className="text-sm text-phish-muted">Features Analyzed</span>
              <span className="text-sm text-white font-medium">12 Extracted Features</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <span className="text-sm text-phish-muted">Model Version</span>
              <span className="text-sm text-white font-medium">v2.0</span>
            </div>
          </div>
        </div>

        {/* Database Status (Placeholder for tomorrow) */}
        <div className="rounded-2xl p-8 md:col-span-2" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/30">
              <Database size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-lg text-white">Database Cluster (MySQL)</h2>
              <p className="text-xs text-phish-muted font-inter">Aiven Cloud Storage Node</p>
            </div>
          </div>

          <div className="flex items-center justify-center p-8 rounded-xl bg-black/20 border border-white/5 border-dashed">
            <div className="text-center">
              <Zap size={32} className="text-phish-muted mx-auto mb-3 opacity-50" />
              <h3 className="text-white font-semibold mb-1">Awaiting Database Integration</h3>
              <p className="text-phish-muted text-sm">MySQL metrics will appear here tomorrow once connected.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
