import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t py-10 mt-20" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,8,22,0.6)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-10">
          
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
                <Shield size={16} className="text-white" />
              </div>
              <div className="leading-none">
                <span className="font-grotesk font-bold text-sm text-white">PhishGuard</span>
                <span className="font-grotesk font-bold text-sm text-phish-primary">&nbsp;AI</span>
              </div>
            </Link>
            <p className="text-phish-muted text-xs mb-2">AI Based Phishing Website Detection System</p>
            <p className="text-phish-muted text-xs mb-1">Anurag University</p>
            <p className="text-phish-muted text-xs">Department of Artificial Intelligence</p>
          </div>

          <div className="md:text-right">
            <h4 className="font-grotesk font-semibold text-white text-sm mb-4">Developed By</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-white">K. Keerthana</p>
                <p className="text-xs text-phish-muted">Machine Learning Engineer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white">I. Sathwik</p>
                <p className="text-xs text-phish-muted">Backend Developer</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Ch. Eeshan Rohith</p>
                <p className="text-xs text-phish-muted">Frontend Developer & UI Designer</p>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="mt-10 pt-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-phish-muted text-xs">© 2026 PhishGuard AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
