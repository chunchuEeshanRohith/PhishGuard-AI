import { STORAGE_MODE } from '../config/storage';

const STORAGE_KEY = 'phishguard_scans';

class HistoryService {
  /**
   * Fetch all scan history
   */
  async getHistory() {
    if (STORAGE_MODE === 'local') {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } else {
      // MySQL integration for tomorrow
      throw new Error('MySQL storage mode not implemented yet.');
    }
  }

  /**
   * Save a single scan result
   */
  async saveScan(scanResult) {
    if (STORAGE_MODE === 'local') {
      const history = await this.getHistory();
      
      const newScan = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: scanResult.url,
        prediction: scanResult.prediction,
        confidence: scanResult.confidence,
        threat_score: scanResult.threat_score,
        risk_level: scanResult.risk_level,
        processing_time_ms: scanResult.processing_time_ms,
        scan_time: scanResult.scan_time,
        request_id: scanResult.request_id,
        created_at: new Date().toISOString()
      };

      const updatedHistory = [newScan, ...history];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return newScan;
    } else {
      // MySQL integration for tomorrow
      throw new Error('MySQL storage mode not implemented yet.');
    }
  }

  /**
   * Delete a specific scan by ID
   */
  async deleteScan(id) {
    if (STORAGE_MODE === 'local') {
      const history = await this.getHistory();
      const updatedHistory = history.filter(scan => scan.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return true;
    } else {
      // MySQL integration for tomorrow
      throw new Error('MySQL storage mode not implemented yet.');
    }
  }

  /**
   * Delete all history
   */
  async deleteAll() {
    if (STORAGE_MODE === 'local') {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } else {
      // MySQL integration for tomorrow
      throw new Error('MySQL storage mode not implemented yet.');
    }
  }

  /**
   * Export history as CSV
   */
  async exportCSV() {
    const history = await this.getHistory();
    if (!history.length) return null;

    const headers = [
      'ID', 'Request ID', 'URL', 'Prediction', 'Confidence', 
      'Threat Score', 'Risk Level', 'Processing Time (ms)', 'Scan Time'
    ];
    
    const rows = history.map(scan => [
      scan.id,
      scan.request_id,
      `"${scan.url}"`, // Escape commas in URL
      scan.prediction,
      scan.confidence,
      scan.threat_score,
      scan.risk_level,
      scan.processing_time_ms,
      scan.scan_time
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `phishguard_history_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }
}

export const historyService = new HistoryService();
