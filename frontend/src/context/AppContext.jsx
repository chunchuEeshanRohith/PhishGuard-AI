import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

const initialHistory = [
  { id: 1, url: 'http://paypal-secure-login.phishsite.com', status: 'danger', confidence: 97.3, date: '2025-07-03 14:22', features: { hasHTTPS: false, domainAge: '3 days', redirects: 3 } },
  { id: 2, url: 'https://www.google.com', status: 'safe', confidence: 98.9, date: '2025-07-03 13:15', features: { hasHTTPS: true, domainAge: '25+ years', redirects: 0 } },
  { id: 3, url: 'http://bankofamerica-update.xyz', status: 'danger', confidence: 94.1, date: '2025-07-03 12:08', features: { hasHTTPS: false, domainAge: '1 day', redirects: 5 } },
  { id: 4, url: 'https://github.com', status: 'safe', confidence: 99.2, date: '2025-07-03 11:30', features: { hasHTTPS: true, domainAge: '18+ years', redirects: 0 } },
  { id: 5, url: 'http://amazon-prize-winner.info', status: 'danger', confidence: 96.5, date: '2025-07-02 22:45', features: { hasHTTPS: false, domainAge: '2 days', redirects: 4 } },
  { id: 6, url: 'https://stripe.com', status: 'safe', confidence: 99.8, date: '2025-07-02 19:20', features: { hasHTTPS: true, domainAge: '20+ years', redirects: 0 } },
  { id: 7, url: 'http://microsoft-account-verify.tk', status: 'danger', confidence: 91.7, date: '2025-07-02 16:10', features: { hasHTTPS: false, domainAge: '5 days', redirects: 2 } },
  { id: 8, url: 'https://vercel.com', status: 'safe', confidence: 99.5, date: '2025-07-02 14:05', features: { hasHTTPS: true, domainAge: '10+ years', redirects: 0 } },
];

export function AppProvider({ children }) {
  const [scanResult, setScanResult]   = useState(null);
  const [history, setHistory]         = useState(initialHistory);
  const [isScanning, setIsScanning]   = useState(false);
  const [currentURL, setCurrentURL]   = useState('');
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [user, setUser]               = useState(null);

  const addToHistory = useCallback((entry) => {
    setHistory(prev => [entry, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const login = useCallback((email) => {
    setIsLoggedIn(true);
    setUser({ email, name: 'Admin User', role: 'admin', avatar: null });
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  return (
    <AppContext.Provider value={{
      scanResult, setScanResult,
      history, addToHistory, clearHistory,
      isScanning, setIsScanning,
      currentURL, setCurrentURL,
      isLoggedIn, user, login, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
