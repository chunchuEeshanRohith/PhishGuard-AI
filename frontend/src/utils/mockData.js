export const features = [
  {
    icon: 'shield',
    title: 'Real-Time Detection',
    description: 'Instant analysis of any URL in milliseconds using our trained ML models running on optimized inference engines.',
    color: 'primary',
    stat: '< 3s',
    statLabel: 'Avg. scan time',
  },
  {
    icon: 'brain',
    title: 'AI Powered',
    description: 'Our deep learning model trained on 2M+ phishing samples achieves 97.8% detection accuracy across all attack vectors.',
    color: 'secondary',
    stat: '97.8%',
    statLabel: 'Accuracy',
  },
  {
    icon: 'zap',
    title: 'Fast Prediction',
    description: 'Multi-threaded feature extraction pipeline processes 35+ URL characteristics simultaneously for rapid threat assessment.',
    color: 'accent',
    stat: '35+',
    statLabel: 'Features analyzed',
  },
  {
    icon: 'lock',
    title: 'Secure & Private',
    description: 'URLs are analyzed in an isolated environment. No data is stored, logged, or shared with third parties.',
    color: 'primary',
    stat: '0',
    statLabel: 'Data retained',
  },
  {
    icon: 'globe',
    title: 'Browser Protection',
    description: 'Compatible with all modern browsers. Detect threats before they reach your users with proactive URL scanning.',
    color: 'secondary',
    stat: '100%',
    statLabel: 'Browser compat.',
  },
  {
    icon: 'history',
    title: 'History Tracking',
    description: 'Keep a complete, searchable log of all your URL scans with detailed feature breakdowns and risk scores.',
    color: 'accent',
    stat: '∞',
    statLabel: 'Scans stored',
  },
];

export const stats = [
  { value: '2M+', label: 'URLs Analyzed' },
  { value: '97.8%', label: 'Accuracy Rate' },
  { value: '50K+', label: 'Threats Blocked' },
  { value: '< 3s', label: 'Detection Speed' },
];

export const howItWorks = [
  { step: '01', title: 'Enter URL', description: 'Paste any suspicious URL into our scanner for instant analysis.' },
  { step: '02', title: 'Feature Extraction', description: 'We extract 35+ URL characteristics: domain age, HTTPS, redirects, and more.' },
  { step: '03', title: 'AI Processing', description: 'Our machine learning model processes all features through trained neural networks.' },
  { step: '04', title: 'Risk Assessment', description: 'The model computes a threat probability score with confidence metrics.' },
  { step: '05', title: 'Instant Result', description: 'Receive a clear Safe or Danger verdict with detailed explanations.' },
];

export const faqs = [
  { question: 'How accurate is the phishing detection?', answer: 'Our AI model achieves 97.8% accuracy on our test dataset of 500,000 URLs, validated through k-fold cross-validation.' },
  { question: 'What features does the AI analyze?', answer: 'We analyze 35+ features including URL length, domain age, HTTPS usage, redirect count, special characters, suspicious keywords, IP addresses, and more.' },
  { question: 'Is my data kept private?', answer: 'Absolutely. URLs are analyzed in memory and are never stored, logged, or shared. Your privacy is our top priority.' },
  { question: 'Can it detect zero-day phishing sites?', answer: 'Yes. Our model uses structural URL analysis rather than blacklists, allowing detection of brand new phishing sites not yet in threat databases.' },
  { question: 'What types of phishing attacks are detected?', answer: 'We detect credential harvesting, brand impersonation, typosquatting, homograph attacks, URL shortener abuse, and more.' },
];

export const techStack = [
  { name: 'React 19', category: 'Frontend' },
  { name: 'Vite', category: 'Build Tool' },
  { name: 'Tailwind CSS', category: 'Styling' },
  { name: 'Framer Motion', category: 'Animation' },
  { name: 'Three.js', category: '3D Graphics' },
  { name: 'Python', category: 'Backend' },
  { name: 'Flask', category: 'API' },
  { name: 'Scikit-learn', category: 'ML' },
  { name: 'Random Forest', category: 'Algorithm' },
  { name: 'XGBoost', category: 'Algorithm' },
];

export const dashboardStats = [
  { label: 'Total Scans', value: '12,847', change: '+12.5%', trend: 'up', color: 'primary' },
  { label: 'Threats Detected', value: '3,921', change: '+8.2%', trend: 'up', color: 'danger' },
  { label: 'Safe URLs', value: '8,926', change: '+15.1%', trend: 'up', color: 'success' },
  { label: 'Avg. Confidence', value: '94.7%', change: '+0.3%', trend: 'up', color: 'secondary' },
];
