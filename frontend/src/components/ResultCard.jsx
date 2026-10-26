import React from 'react';
import AttentionHeatmap from './AttentionHeatmap';
import ThreatConsensus from './ThreatConsensus';

export default function ResultCard({ result }) {
  if (!result) return null;

  const isPhishing = result.prediction === 'Phishing';
  const confidencePercent = (result.confidence * 100).toFixed(2);

  return (
    <div className={`mt-8 w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl border ${isPhishing ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30'} transition-all duration-500 ease-in-out transform`}>
      <div className={`p-6 border-b ${isPhishing ? 'border-red-500/20' : 'border-green-500/20'} flex items-center gap-4`}>
        {isPhishing ? (
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
             <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
             <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
        )}
        
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isPhishing ? 'text-red-400' : 'text-green-400'}`}>
            {isPhishing ? 'PHISHING DETECTED' : 'WEBSITE APPEARS LEGITIMATE'}
          </h2>
          <p className="text-gray-300 text-sm mt-1 truncate max-w-sm sm:max-w-md">{result.url}</p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {isPhishing && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-sm flex gap-3">
             <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <p>Do not enter passwords, payment information, or personal information on this website.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Threat Score</p>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${isPhishing ? 'text-red-400' : 'text-green-400'}`}>
                {result.threat_score}
              </span>
              <span className="text-gray-500 font-medium mb-1">/ 100</span>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Confidence</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">
                {confidencePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Explainable AI: Character-Level Self-Attention Heatmap */}
        {result.attention_analysis && (
          <AttentionHeatmap
            attentionData={result.attention_analysis}
            prediction={result.prediction}
            threatScore={result.threat_score}
            url={result.url}
          />
        )}

        {/* Multi-Engine Threat Consensus */}
        {result.consensus_analysis && (
          <ThreatConsensus
            consensusData={result.consensus_analysis}
            prediction={result.prediction}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Model</p>
            <p className="text-gray-300 font-medium mt-1">{result.model || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Version</p>
            <p className="text-gray-300 font-medium mt-1">{result.model_version || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Scan Time</p>
            <p className="text-gray-300 font-medium mt-1 text-sm">{new Date(result.scan_time).toLocaleString() || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
