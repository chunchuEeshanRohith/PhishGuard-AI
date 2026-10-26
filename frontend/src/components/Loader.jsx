import React, { useState, useEffect } from 'react';

const steps = [
  "Analyzing URL...",
  "Extracting URL patterns...",
  "Running AI detection...",
  "Finalizing results..."
];

export default function Loader({ isScanning }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isScanning) {
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="mt-12 w-full max-w-md mx-auto flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <div className="h-6 overflow-hidden relative w-full text-center">
        {steps.map((step, index) => (
          <p
            key={index}
            className={`absolute w-full font-medium transition-all duration-500 ${
              index === currentStep
                ? 'opacity-100 transform translate-y-0 text-blue-400'
                : index < currentStep
                ? 'opacity-0 transform -translate-y-full text-gray-500'
                : 'opacity-0 transform translate-y-full text-gray-500'
            }`}
          >
            {step}
          </p>
        ))}
      </div>
      
      <div className="w-full bg-gray-800 rounded-full h-1.5 mt-6 overflow-hidden">
        <div 
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
