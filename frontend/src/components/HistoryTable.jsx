import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, ExternalLink, ChevronLeft, ChevronRight, Shield, Download } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { historyService } from '../services/historyService';
import toast from 'react-hot-toast';

const PAGE_SIZE = 8;

export default function HistoryTable({ mode = 'user' }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterPrediction, setFilterPrediction] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (err) {
      toast.error('Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to delete ALL history?')) {
      await historyService.deleteAll();
      setHistory([]);
      toast.success('History cleared successfully.');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Delete this record?')) {
      await historyService.deleteScan(id);
      setHistory(history.filter(h => h.id !== id));
      toast.success('Record deleted.');
    }
  };

  const exportData = async () => {
    await historyService.exportCSV();
    toast.success('Exported to CSV');
  };

  const filtered = useMemo(() => {
    return history
      .filter(h => h.url.toLowerCase().includes(searchTerm.toLowerCase()) || (h.request_id && h.request_id.toLowerCase().includes(searchTerm.toLowerCase())))
      .filter(h => filterRisk === 'all' || h.risk_level.toLowerCase() === filterRisk.toLowerCase())
      .filter(h => filterPrediction === 'all' || h.prediction.toLowerCase() === filterPrediction.toLowerCase())
      .sort((a, b) => {
        const timeA = new Date(a.scan_time).getTime();
        const timeB = new Date(b.scan_time).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [history, searchTerm, filterRisk, filterPrediction, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="py-20 text-center text-phish-muted">Loading history...</div>;
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-phish-muted" />
          <input
            type="text"
            placeholder="Search URLs or Request IDs..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="input-cyber pl-10 py-2.5 text-sm w-full"
            style={{ borderRadius: '0.75rem' }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filters */}
          <select 
            value={filterPrediction} 
            onChange={e => { setFilterPrediction(e.target.value); setPage(1); }}
            className="input-cyber py-2.5 px-4 text-sm"
            style={{ borderRadius: '0.75rem', maxWidth: '160px' }}
          >
            <option value="all">All Predictions</option>
            <option value="legitimate">Legitimate</option>
            <option value="suspicious">Suspicious</option>
            <option value="phishing">Phishing</option>
          </select>

          <select 
            value={filterRisk} 
            onChange={e => { setFilterRisk(e.target.value); setPage(1); }}
            className="input-cyber py-2.5 px-4 text-sm"
            style={{ borderRadius: '0.75rem', maxWidth: '140px' }}
          >
            <option value="all">All Risks</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select 
            value={sortBy} 
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="input-cyber py-2.5 px-4 text-sm"
            style={{ borderRadius: '0.75rem', maxWidth: '130px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button onClick={exportData} disabled={!history.length}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-grotesk font-medium text-phish-muted hover:text-white transition-colors disabled:opacity-50"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            <Download size={14} />
            Export CSV
          </button>
          
          <button onClick={clearHistory} disabled={!history.length}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-grotesk font-medium text-phish-danger hover:bg-red-500/10 transition-colors disabled:opacity-50"
            style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={14} />
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 text-phish-muted rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,15,46,0.4)' }}
        >
          <Shield size={40} className="mx-auto mb-4 opacity-20" />
          <p className="font-grotesk font-medium">
            {history.length === 0 ? 'No scans recorded.' : 'No results match your filters.'}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="rounded-2xl overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-5 py-3 text-xs font-grotesk font-semibold uppercase tracking-wider text-phish-muted"
                style={{ background: 'rgba(10,15,46,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {mode === 'admin' && <div className="col-span-2">Req ID</div>}
                <div className={mode === 'admin' ? "col-span-2" : "col-span-4"}>URL</div>
                <div className="col-span-2">Prediction</div>
                <div className="col-span-1 text-center">Score</div>
                <div className="col-span-1 text-center">Risk</div>
                <div className="col-span-3">Time</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Rows */}
              {paginated.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="grid grid-cols-12 gap-3 items-center px-5 py-3.5 border-b last:border-b-0 transition-all group hover:bg-phish-primary/5"
                  style={{ borderColor: 'rgba(255,255,255,0.04)', background: 'rgba(10,15,46,0.4)' }}
                >
                  {mode === 'admin' && (
                    <div className="col-span-2 text-xs font-mono text-phish-muted truncate" title={item.request_id}>
                      {item.request_id}
                    </div>
                  )}
                  
                  <div className={`${mode === 'admin' ? "col-span-2" : "col-span-4"} flex items-center gap-2`}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="font-inter text-xs text-phish-muted hover:text-phish-primary truncate flex items-center gap-1 max-w-full">
                      <span className="truncate">{item.url}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                  
                  <div className="col-span-2">
                    <StatusBadge status={
                      item.prediction.toLowerCase() === 'legitimate' ? 'safe' :
                      item.prediction.toLowerCase() === 'suspicious' ? 'warning' : 'danger'
                    } size="sm" pulse={false} />
                  </div>
                  
                  <div className="col-span-1 text-center font-inter text-xs font-semibold"
                    style={{ color: item.threat_score > 70 ? '#EF4444' : item.threat_score > 30 ? '#EAB308' : '#22C55E' }}>
                    {item.threat_score}
                  </div>
                  
                  <div className="col-span-1 text-center text-xs font-grotesk text-phish-muted">
                    {item.risk_level}
                  </div>
                  
                  <div className="col-span-3 text-xs text-phish-muted font-inter">
                    {new Date(item.scan_time).toLocaleString()}
                    {mode === 'admin' && <div className="text-[10px] opacity-60">{item.processing_time_ms}ms</div>}
                  </div>
                  
                  <div className="col-span-1 text-right">
                    <button onClick={() => deleteItem(item.id)} className="text-phish-muted hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <span className="text-xs text-phish-muted font-inter">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-phish-muted hover:text-white disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <ChevronLeft size={14} />
                </button>
                <span className="flex items-center text-xs font-grotesk px-2">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-phish-muted hover:text-white disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
