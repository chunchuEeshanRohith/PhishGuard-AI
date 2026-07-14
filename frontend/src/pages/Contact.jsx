import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Send, Mail, MessageSquare, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionHeading from '../components/SectionHeading';

export default function Contact() {
  const [formData, setFormData] = useState({ email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent successfully!');
    setFormData({ email: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="section relative min-h-[90vh]">
      {/* Background elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: '80vw', height: '80vh',
          background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 60%)',
        }} />
      </div>

      <div className="container-lg relative z-10 pt-10">
        <SectionHeading
          badge="Get in Touch"
          title="Contact the"
          highlight="Team"
          subtitle="Have questions about our AI detection system? Send us a message."
        />

        <div className="grid lg:grid-cols-2 gap-12 mt-12 max-w-5xl mx-auto">
          
          {/* Project Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="rounded-3xl p-8" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
                <Shield size={24} className="text-white" />
              </div>
              
              <h2 className="font-grotesk font-bold text-2xl text-white mb-2">PhishGuard AI</h2>
              <p className="text-phish-primary font-inter text-sm mb-8">AI Based Phishing Website Detection System</p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <MapPin size={18} className="text-phish-primary" />
                  </div>
                  <div>
                    <h4 className="font-grotesk font-semibold text-white text-sm mb-1">University</h4>
                    <p className="text-phish-muted text-sm leading-relaxed">Anurag University<br/>Department of Artificial Intelligence</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <Users size={18} className="text-phish-primary" />
                  </div>
                  <div>
                    <h4 className="font-grotesk font-semibold text-white text-sm mb-2">Development Team</h4>
                    <ul className="text-phish-muted text-sm space-y-1">
                      <li>• K. Keerthana</li>
                      <li>• I. Sathwik</li>
                      <li>• Ch. Eeshan Rohith</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-3xl p-8 h-full" style={{ background: 'rgba(10,15,46,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-grotesk font-bold text-xl text-white mb-6">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-grotesk font-medium text-phish-muted pl-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-phish-muted" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="input-cyber pl-11 py-3 text-sm w-full"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-grotesk font-medium text-phish-muted pl-1">Message</label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-4 top-4 text-phish-muted" />
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      className="input-cyber pl-11 py-3 text-sm w-full min-h-[150px] resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 mt-2 rounded-xl font-grotesk font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
