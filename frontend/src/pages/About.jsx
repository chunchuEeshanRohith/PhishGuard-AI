import { motion } from 'framer-motion';
import { Shield, Brain, Code, Terminal, User } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const team = [
  {
    name: 'K. Keerthana',
    roll: '23EG106B28',
    role: 'Machine Learning Engineer',
    icon: <Brain size={24} className="text-white" />,
    color: '#8B5CF6'
  },
  {
    name: 'I. Sathwik',
    roll: '23EG106B21',
    role: 'Backend Developer',
    icon: <Terminal size={24} className="text-white" />,
    color: '#0EA5E9'
  },
  {
    name: 'Ch. Eeshan Rohith',
    roll: '23EG106B14',
    role: 'Frontend Developer & UI Designer',
    icon: <Code size={24} className="text-white" />,
    color: '#10B981'
  }
];

export default function About() {
  return (
    <div className="section">
      <div className="container-lg">
        
        {/* Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20 pt-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 40px rgba(14,165,233,0.4)' }}>
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="font-grotesk font-bold text-4xl md:text-5xl text-white mb-6">
            Securing the web with <span className="text-phish-primary">Intelligence</span>
          </h1>
          <p className="text-phish-muted text-lg leading-relaxed">
            PhishGuard AI is an advanced cybersecurity project developed by students of Anurag University, Department of Artificial Intelligence. 
            Our system leverages machine learning to analyze lexical features and website behaviors in real-time to detect zero-day phishing attacks.
          </p>
        </motion.div>

        {/* Team Section */}
        <div className="mt-16">
          <SectionHeading
            badge="The Team"
            title="Meet the"
            highlight="Developers"
            subtitle="The engineering team behind PhishGuard AI."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1), duration: 0.6 }}
                className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-300"
                style={{ 
                  background: 'rgba(10,15,46,0.6)', 
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = member.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${member.color} 0%, transparent 70%)` }} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                    style={{ background: `linear-gradient(135deg, ${member.color}bb, ${member.color})`, boxShadow: `0 0 20px ${member.color}40` }}>
                    {member.icon}
                  </div>
                  
                  <h3 className="font-grotesk font-bold text-xl text-white mb-2">{member.name}</h3>
                  <p className="text-phish-muted font-inter text-sm mb-4">Roll No: {member.roll}</p>
                  
                  <div className="px-4 py-1.5 rounded-full text-xs font-grotesk font-semibold"
                    style={{ background: `${member.color}20`, color: member.color, border: `1px solid ${member.color}40` }}>
                    {member.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
