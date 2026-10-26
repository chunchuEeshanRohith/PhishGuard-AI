import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Brain, CheckCircle } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import FeatureCard from '../components/FeatureCard';
import CyberGlobe from '../components/three/CyberGlobe';
import { features } from '../utils/mockData';

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: '80vw', maxWidth: 900,
          height: '80vh',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(14,165,233,0.12) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
        }} />
      </div>

      <motion.div
        className="absolute top-16 right-8 md:right-16 opacity-20 md:opacity-30 pointer-events-none"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Shield size={80} className="text-phish-primary" strokeWidth={0.8} />
      </motion.div>

      <motion.div
        className="absolute bottom-24 left-8 md:left-16 opacity-20 pointer-events-none"
        animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <Brain size={60} className="text-phish-secondary" strokeWidth={0.8} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-grotesk font-bold text-5xl md:text-7xl leading-[1.08] tracking-tight mb-6 max-w-4xl"
      >
        <span className="text-white">AI-Based</span>{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Phishing</span>
        <br />
        <span className="text-white">Website Detection</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
      >
        Our advanced Siamese Deep Learning architecture analyzes websites in real-time to protect you from malicious phishing attempts.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link 
          to="/scanner"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 24px rgba(14,165,233,0.3)' }}
        >
          Scan a URL
          <ArrowRight size={20} />
        </Link>
      </motion.div>
    </section>
  );
}

function GlobeSection() {
  return (
    <section className="section relative overflow-hidden py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading
              badge="Global Threat Intelligence"
              title="Real-time threat"
              highlight="detection network"
              subtitle="Our AI monitors malicious URL patterns worldwide, analyzing millions of domains to keep you protected 24/7."
              center={false}
            />
            <div className="flex flex-col gap-4 mt-8">
              {['Siamese Network similarity detection', 'BiLSTM character-level sequence modeling', 'Self-Attention mechanism for crucial domain parts'].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-3 text-gray-400 text-sm"
                >
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <CyberGlobe height={420} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="section py-24 bg-[#0B1120]/50">
      <div className="container mx-auto px-4">
        <SectionHeading
          badge="Capabilities"
          title="Everything you need to"
          highlight="stay protected"
          subtitle="Powered by machine learning, our platform delivers enterprise-grade security in a simple, accessible interface."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-[#0B1120] text-white">
      <HeroSection />
      <GlobeSection />
      <FeaturesSection />
    </div>
  );
}
