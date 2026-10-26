import React, { useState } from 'react';
import ScannerInput from '../components/ScannerInput';
import Loader from '../components/Loader';
import ResultCard from '../components/ResultCard';
import { predictURL } from '../services/api';
import toast from 'react-hot-toast';

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (url) => {
    setIsScanning(true);
    setResult(null);
    
    try {
      // Small artificial delay for the UI scanning animations to complete
      const minWait = new Promise(resolve => setTimeout(resolve, 3200));
      const apiCall = predictURL(url);
      
      const [apiResult] = await Promise.all([apiCall, minWait]);
      setResult(apiResult);
    } catch (error) {
      toast.error(error.message || 'An error occurred during scanning.');
      setResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0B1120] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Phishing Website</span> Scanner
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Enter a website URL below to analyze it using our advanced Siamese Deep Learning architecture. We detect malicious patterns in real-time.
          </p>
        </div>

        <ScannerInput onScan={handleScan} isLoading={isScanning} />
        
        <Loader isScanning={isScanning} />
        
        {!isScanning && result && (
          <ResultCard result={result} />
        )}
      </div>
    </div>
  );
}
