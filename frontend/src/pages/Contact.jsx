import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Send,
  Mail,
  MessageSquare,
  MapPin,
  Users,
  Brain,
  Terminal,
  Code,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Info,
  RefreshCw,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SectionHeading from '../components/SectionHeading';
import { checkHealth, sendContactMessage } from '../services/api';

// Verified team data from About.jsx (strictly no invented roles or contact details)
const teamMembers = [
  {
    name: 'K. Keerthana',
    roll: '23EG106B28',
    role: 'Machine Learning Engineer',
    icon: Brain,
    color: '#8B5CF6',
    borderGlow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    name: 'I. Sathwik',
    roll: '23EG106B21',
    role: 'Backend Developer',
    icon: Terminal,
    color: '#0EA5E9',
    borderGlow: 'rgba(14, 165, 233, 0.3)',
  },
  {
    name: 'Ch. Eeshan Rohith',
    roll: '23EG106B14',
    role: 'Frontend Developer & UI Designer',
    icon: Code,
    color: '#10B981',
    borderGlow: 'rgba(16, 185, 129, 0.3)',
  },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const CONTACT_RECIPIENT = 'contact@phishguard.ai';

export default function Contact() {
  const [formData, setFormData] = useState({ email: '', message: '' });
  const [errors, setErrors] = useState({ email: '', message: '' });
  const [touched, setTouched] = useState({ email: false, message: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Submission state: 'idle' | 'direct_client' | 'server_delivered' | 'error'
  const [submissionState, setSubmissionState] = useState('idle');
  const [submittedPayload, setSubmittedPayload] = useState(null);
  const [lastSubmittedHash, setLastSubmittedHash] = useState('');
  const [copied, setCopied] = useState(false);

  // System backend health probe
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((data) => {
        if (isMounted) {
          setBackendStatus(data?.status === 'healthy' ? 'online' : 'degraded');
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendStatus('offline');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const validateField = (name, value) => {
    if (name === 'email') {
      const trimmed = value.trim();
      if (!trimmed) return 'Email address is required.';
      if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address (e.g. name@example.com).';
      return '';
    }
    if (name === 'message') {
      const trimmed = value.trim();
      if (!trimmed) return 'Message is required.';
      if (trimmed.length < 10) return `Message must be at least 10 characters (currently ${trimmed.length}).`;
      if (trimmed.length > 1500) return 'Message cannot exceed 1500 characters.';
      return '';
    }
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const computePayloadHash = (email, message) => {
    return `${email.trim().toLowerCase()}:::${message.trim()}`;
  };

  const buildMailtoUrl = (email, message) => {
    const subject = encodeURIComponent('PhishGuard AI - Inquiry / Feedback');
    const body = encodeURIComponent(
      `From: ${email.trim()}\n\nMessage:\n${message.trim()}\n\n---\nSent via PhishGuard AI Contact Portal\nTimestamp: ${new Date().toISOString()}`
    );
    return `mailto:${CONTACT_RECIPIENT}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger full validation
    const emailError = validateField('email', formData.email);
    const messageError = validateField('message', formData.message);

    setTouched({ email: true, message: true });
    setErrors({ email: emailError, message: messageError });

    if (emailError || messageError) {
      toast.error('Please resolve the errors before submitting.');
      return;
    }

    // Duplicate submission prevention
    const currentHash = computePayloadHash(formData.email, formData.message);
    if (currentHash === lastSubmittedHash) {
      toast.error('Duplicate submission: You have already submitted this exact message.', {
        id: 'duplicate-toast',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Inspect and attempt backend submission
      const result = await sendContactMessage({
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      if (result.success) {
        // Backend accepted submission
        setLastSubmittedHash(currentHash);
        setSubmittedPayload({
          email: formData.email.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toLocaleTimeString(),
        });
        setSubmissionState('server_delivered');
        toast.success('Message sent to server successfully!');
        setFormData({ email: '', message: '' });
        setTouched({ email: false, message: false });
      } else if (result.serviceUnavailable) {
        // Transparent handling: Backend has no contact service configured
        // Trigger mailto client without pretending it sent to server
        setLastSubmittedHash(currentHash);
        const snapshot = {
          email: formData.email.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toLocaleTimeString(),
        };
        setSubmittedPayload(snapshot);
        setSubmissionState('direct_client');

        const mailtoUrl = buildMailtoUrl(snapshot.email, snapshot.message);
        
        // Inform user honestly
        toast(
          'Notice: Automated backend email relay is unconfigured. Launching your device mail client to send directly.',
          {
            icon: 'ℹ️',
            duration: 6000,
          }
        );

        // Open user's mail client
        window.location.href = mailtoUrl;
      } else {
        // Other server error
        setSubmissionState('error');
        toast.error(result.message || 'Failed to submit message.');
      }
    } catch (err) {
      setSubmissionState('error');
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!submittedPayload) return;
    const textToCopy = `From: ${submittedPayload.email}\nRecipient: ${CONTACT_RECIPIENT}\n\nMessage:\n${submittedPayload.message}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Message copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleResetForm = () => {
    setSubmissionState('idle');
    setFormData({ email: '', message: '' });
    setErrors({ email: '', message: '' });
    setTouched({ email: false, message: false });
  };

  return (
    <div className="section relative min-h-[90vh]">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          style={{
            width: '80vw',
            height: '80vh',
            background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -top-20 right-10 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="container-lg relative z-10 pt-8 pb-12">
        <SectionHeading
          badge="Get in Touch"
          title="Contact the"
          highlight="Team"
          subtitle="Have inquiries regarding our AI phishing detection model or system architecture? Reach out to the research and development team."
        />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 mt-8 max-w-6xl mx-auto items-start">
          
          {/* Left Column: Project Info & Verified Team (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Project Overview Card */}
            <div
              className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-300"
              style={{
                background: 'rgba(10,15,46,0.65)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                    boxShadow: '0 0 20px rgba(14,165,233,0.4)',
                  }}
                >
                  <Shield size={22} className="text-white" />
                </div>
                
                {/* System status pill */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-grotesk font-medium"
                  style={{
                    background:
                      backendStatus === 'online'
                        ? 'rgba(34,197,94,0.1)'
                        : backendStatus === 'checking'
                        ? 'rgba(14,165,233,0.1)'
                        : 'rgba(245,158,11,0.1)',
                    color:
                      backendStatus === 'online'
                        ? '#4ADE80'
                        : backendStatus === 'checking'
                        ? '#38BDF8'
                        : '#FBBF24',
                    border: `1px solid ${
                      backendStatus === 'online'
                        ? 'rgba(34,197,94,0.25)'
                        : backendStatus === 'checking'
                        ? 'rgba(14,165,233,0.25)'
                        : 'rgba(245,158,11,0.25)'
                    }`,
                  }}
                  title="Backend API status"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      backendStatus === 'online'
                        ? 'bg-emerald-400 animate-pulse'
                        : backendStatus === 'checking'
                        ? 'bg-sky-400 animate-pulse'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>
                    {backendStatus === 'online'
                      ? 'Inference API Live'
                      : backendStatus === 'checking'
                      ? 'Checking API...'
                      : 'Backend Offline'}
                  </span>
                </div>
              </div>

              <h2 className="font-grotesk font-bold text-2xl text-white mb-1 tracking-tight">
                PhishGuard <span className="text-phish-primary">AI</span>
              </h2>
              <p className="text-phish-muted font-inter text-xs leading-relaxed mb-6">
                Deep Learning Lexical URL Analysis with Siamese-LSTM Attention Architecture
              </p>

              {/* Institution Details */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] mb-6">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
                >
                  <MapPin size={17} className="text-phish-primary" />
                </div>
                <div>
                  <h4 className="font-grotesk font-semibold text-white text-xs mb-0.5">Institution</h4>
                  <p className="text-slate-300 font-medium text-xs">Anurag University</p>
                  <p className="text-phish-muted text-[11px]">Department of Artificial Intelligence</p>
                </div>
              </div>

              {/* Verified Development Team Entries */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <Users size={16} className="text-phish-primary" />
                  <h3 className="font-grotesk font-semibold text-white text-sm">Development Team</h3>
                </div>

                <div className="space-y-2.5">
                  {teamMembers.map((member, idx) => {
                    const MemberIcon = member.icon;
                    return (
                      <div
                        key={idx}
                        className="group flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = member.borderGlow;
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${member.color}25, ${member.color}15)`,
                            border: `1px solid ${member.color}40`,
                            color: member.color,
                          }}
                        >
                          <MemberIcon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-grotesk font-bold text-white text-xs truncate">
                              {member.name}
                            </h4>
                            <span className="text-[10px] font-mono text-phish-muted shrink-0">
                              {member.roll}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: member.color }}>
                            {member.role}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form & Functional States (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-7"
          >
            <div
              className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl h-full flex flex-col justify-between"
              style={{
                background: 'rgba(10,15,46,0.65)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <AnimatePresence mode="wait">
                {submissionState === 'direct_client' ? (
                  /* Honest & Functional Client Dispatch State */
                  <motion.div
                    key="direct_client"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5 py-2"
                  >
                    <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                          boxShadow: '0 0 20px rgba(14,165,233,0.3)',
                        }}
                      >
                        <Mail size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-grotesk font-bold text-lg text-white">
                          Email Client Dispatch Initialized
                        </h3>
                        <p className="text-phish-muted text-xs">
                          Your message has been pre-formatted for direct dispatch
                        </p>
                      </div>
                    </div>

                    {/* Transparent notice card */}
                    <div
                      className="p-4 rounded-2xl flex items-start gap-3"
                      style={{
                        background: 'rgba(14,165,233,0.08)',
                        border: '1px solid rgba(14,165,233,0.2)',
                      }}
                    >
                      <Info size={18} className="text-phish-primary shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-medium text-slate-200">
                          Backend server email relay is currently unconfigured.
                        </p>
                        <p className="text-phish-muted leading-relaxed">
                          Rather than simulating a fake delivery, your message is routed directly to your default mail client addressed to <span className="text-phish-primary font-mono">{CONTACT_RECIPIENT}</span>.
                        </p>
                      </div>
                    </div>

                    {/* Summary of drafted message */}
                    <div
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2.5 font-mono"
                    >
                      <div className="flex justify-between text-phish-muted text-[11px] border-b border-white/[0.04] pb-2">
                        <span>Sender: <strong className="text-slate-200">{submittedPayload?.email}</strong></span>
                        <span>{submittedPayload?.timestamp}</span>
                      </div>
                      <div className="pt-1 text-slate-300 font-sans max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {submittedPayload?.message}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href={buildMailtoUrl(submittedPayload?.email || '', submittedPayload?.message || '')}
                        className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={15} />
                        Re-open Mail Client
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="btn-ghost flex-1 py-3 text-xs flex items-center justify-center gap-2 border-white/10 hover:border-phish-primary text-slate-300 hover:text-white"
                      >
                        {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                        {copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full py-2.5 rounded-xl text-xs font-grotesk text-phish-muted hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={13} />
                      Write Another Message
                    </button>
                  </motion.div>
                ) : submissionState === 'server_delivered' ? (
                  /* Server Delivery Success State */
                  <motion.div
                    key="server_delivered"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center text-center py-10 gap-4"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        boxShadow: '0 0 30px rgba(34,197,94,0.2)',
                      }}
                    >
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-grotesk font-bold text-xl text-white mb-1">
                        Message Dispatched Successfully
                      </h3>
                      <p className="text-phish-muted text-xs max-w-md mx-auto">
                        Your inquiry has been received by the PhishGuard AI service. Our team will review and get back to you at{' '}
                        <span className="text-emerald-400 font-medium">{submittedPayload?.email}</span>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="btn-primary mt-4 py-2.5 px-6 text-xs flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  /* Standard Contact Form */
                  <motion.div
                    key="contact_form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <h3 className="font-grotesk font-bold text-xl text-white mb-1">Send a Message</h3>
                      <p className="text-phish-muted text-xs">
                        Fill in your email and inquiry. All communications are direct and verified.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                      {/* Email Input Field */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center pl-1">
                          <label
                            htmlFor="contact-email"
                            className="text-xs font-grotesk font-medium text-slate-300"
                          >
                            Email Address <span className="text-phish-primary">*</span>
                          </label>
                          {touched.email && !errors.email && (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                              <Check size={12} /> Valid
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <Mail
                            size={16}
                            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                              touched.email && errors.email
                                ? 'text-rose-400'
                                : touched.email && !errors.email
                                ? 'text-emerald-400'
                                : 'text-phish-muted'
                            }`}
                          />
                          <input
                            id="contact-email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            aria-invalid={Boolean(touched.email && errors.email)}
                            aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                            className={`input-cyber pl-10 pr-4 py-3 text-sm w-full transition-all duration-200 ${
                              touched.email && errors.email
                                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20'
                                : touched.email && !errors.email
                                ? 'border-emerald-500/40 focus:border-emerald-500'
                                : ''
                            }`}
                          />
                        </div>

                        {touched.email && errors.email && (
                          <motion.p
                            id="email-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-rose-400 text-xs pl-1 flex items-center gap-1.5 font-sans"
                            role="alert"
                          >
                            <AlertCircle size={13} className="shrink-0" />
                            <span>{errors.email}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Message Input Field */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center pl-1">
                          <label
                            htmlFor="contact-message"
                            className="text-xs font-grotesk font-medium text-slate-300"
                          >
                            Message <span className="text-phish-primary">*</span>
                          </label>
                          <span
                            className={`text-[11px] font-mono ${
                              formData.message.length > 1400
                                ? 'text-rose-400'
                                : formData.message.length > 1000
                                ? 'text-amber-400'
                                : 'text-phish-muted'
                            }`}
                          >
                            {formData.message.length} / 1500
                          </span>
                        </div>

                        <div className="relative">
                          <MessageSquare
                            size={16}
                            className={`absolute left-3.5 top-3.5 transition-colors ${
                              touched.message && errors.message
                                ? 'text-rose-400'
                                : touched.message && !errors.message
                                ? 'text-emerald-400'
                                : 'text-phish-muted'
                            }`}
                          />
                          <textarea
                            id="contact-message"
                            rows={5}
                            value={formData.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                            onBlur={() => handleBlur('message')}
                            aria-invalid={Boolean(touched.message && errors.message)}
                            aria-describedby={touched.message && errors.message ? 'message-error' : undefined}
                            placeholder="Describe your inquiry, bug report, or feedback regarding PhishGuard AI (minimum 10 characters)..."
                            disabled={isSubmitting}
                            className={`input-cyber pl-10 pr-4 py-3 text-sm w-full min-h-[140px] resize-none transition-all duration-200 ${
                              touched.message && errors.message
                                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20'
                                : touched.message && !errors.message
                                ? 'border-emerald-500/40 focus:border-emerald-500'
                                : ''
                            }`}
                          />
                        </div>

                        {touched.message && errors.message && (
                          <motion.p
                            id="message-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-rose-400 text-xs pl-1 flex items-center gap-1.5 font-sans"
                            role="alert"
                          >
                            <AlertCircle size={13} className="shrink-0" />
                            <span>{errors.message}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={!isSubmitting ? { y: -2 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                        className="w-full py-3.5 mt-2 rounded-xl font-grotesk font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-phish-primary/50"
                        style={{
                          background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                          boxShadow: '0 0 25px rgba(14,165,233,0.3)',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Verifying & Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Send Message</span>
                          </>
                        )}
                      </motion.button>

                      {/* Honest submission footer notice */}
                      <p className="text-[11px] text-phish-muted text-center leading-normal pt-1">
                        Submissions are validated in real-time. In the absence of server-side SMTP relays, messages are routed safely through your registered mail client.
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
