import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import AppRouter from './routes/AppRouter';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#0F172A', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <AppRouter />
      </AppProvider>
    </BrowserRouter>
  );
}