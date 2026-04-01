export const defaultSiteSetting = {
  brandName: 'JSR Hotels',
  footerTagline: 'Experience luxury, comfort, and an unforgettable journey. Your premium destination awaits.',
};

export const defaultHomeBlocks = [
  {
    type: 'hero',
    heading: 'A Standard of Excellence',
    description: 'Immerse yourself in unparalleled luxury and world-class hospitality at JSR Hotels.',
    ctaText: 'Explore Our Suites',
    ctaUrl: '/portfolio',
    isVisible: true,
    sortOrder: 1,
    payload: { imageUrl: '/hero-bg.png' },
  },
  {
    type: 'pillars',
    heading: 'Our Core Pillars',
    subheading: 'What We Do',
    isVisible: true,
    sortOrder: 2,
    payload: {
      items: [
        { icon: 'TrendingUp', title: 'Investment', desc: 'Identifying sound opportunities and managing hospitality investments strategically for maximized ROI and sustainable growth.' },
        { icon: 'Building2', title: 'Development', desc: 'From architectural design to construction, executing premium concepts perfectly at every phase of the pipeline.' },
        { icon: 'Users', title: 'Management', desc: 'Operating with excellence through strategic brand partnerships and uncompromised, award-winning luxury service.' },
      ],
    },
  },
  {
    type: 'intro',
    heading: 'Redefining Luxury',
    subheading: 'Welcome to JSR Hotels',
    description: "From the moment you arrive, you'll experience a blend of timeless elegance and modern sophistication.",
    ctaText: 'Our Heritage',
    ctaUrl: '/about',
    isVisible: true,
    sortOrder: 3,
    payload: { imageUrl: '/lobby-demo.png' },
  },
  {
    type: 'stats',
    isVisible: true,
    sortOrder: 4,
    payload: {
      items: [
        { label: 'Hotels', value: '12' },
        { label: 'States', value: '4' },
        { label: 'Rooms', value: '2,500+' },
        { label: 'Awards', value: '15+' },
      ],
    },
  },
  {
    type: 'featured',
    heading: 'The Executive Suite',
    subheading: 'Featured Experience',
    description: 'Wake up to panoramic views and unmatched comfort. Designed for those who demand the finest in luxury travel.',
    ctaText: 'View Details',
    ctaUrl: '/portfolio',
    isVisible: true,
    sortOrder: 5,
    payload: {
      imageUrl: '/featured-suite.png',
      features: ['Panoramic City Views', '24/7 Dedicated Butler', 'Exclusive Lounge Access'],
    },
  },
  {
    type: 'leadership',
    heading: 'Like a well-planned hotel, solid investments in hospitality today are the bedrock of a prosperous future.',
    description: '- Nilesh Patel, CEO & Founder',
    isVisible: true,
    sortOrder: 6,
    payload: { imageUrl: '/nilesh.jpeg' },
  },
  {
    type: 'news',
    heading: 'Latest Updates',
    isVisible: true,
    sortOrder: 7,
    payload: {
      items: [
        { date: 'Oct 24, 2025', title: 'JSR Breaks Ground on New Development', desc: 'Our latest coastal resort project officially begins construction.' },
        { date: 'Sep 15, 2025', title: 'Industry Leaders Seminar 2025', desc: 'CEO Nilesh Patel speaks on the future of hospitality.' },
      ],
    },
  },
  {
    type: 'accolades',
    heading: 'Recent Accolades',
    isVisible: true,
    sortOrder: 8,
    payload: {
      items: [
        { title: '2025 Best of The Best Award', desc: 'Recognized for unparalleled service excellence' },
        { title: '2024 Global Hospitality', desc: 'Top 1% worldwide for luxury accommodations' },
        { title: '2023 Business Of The Year', desc: 'City wide recognition for premium experiences' },
      ],
    },
  },
  {
    type: 'newsletter',
    heading: 'Stay Connected',
    description: 'Sign up for our newsletter to receive updates and exclusive investment opportunities.',
    isVisible: true,
    sortOrder: 9,
  },
];

export const defaultAboutSections = [
  {
    title: 'Our Heritage',
    body: 'Founded with a vision to redefine excellence in hospitality, JSR Hotels has consistently set the benchmark for luxury and elegance.',
    sortOrder: 1,
    isVisible: true,
  },
];

export const defaultServices = [
  {
    title: 'Hospitality Investment',
    description: 'Identifying high-yield opportunities and managing investments thoughtfully with dedicated capital markets guidance and asset management.',
    icon: '📈',
    sortOrder: 1,
  },
  {
    title: 'Property Development',
    description: 'End-to-end architectural execution, project management, and premium interior design for ground-up developments and renovations.',
    icon: '🏗️',
    sortOrder: 2,
  },
  {
    title: 'Operations & Management',
    description: 'Comprehensive, award-winning operational leadership ensuring uncompromised guest experiences and maximized property profitability.',
    icon: '🤝',
    sortOrder: 3,
  },
  {
    title: 'Brand Strategy',
    description: 'Strategic partnerships with leading global hospitality flags to secure premium market positioning and long-term brand equity.',
    icon: '💎',
    sortOrder: 4,
  },
];

export const defaultTeamMembers = [
  {
    fullName: 'Nilesh Patel',
    title: 'CEO & Founder | JSR Hotels | Hospitality & Real Estate Growth',
    bio: "Driving JSR Hotels' strategic expansion through real estate and hospitality leadership.",
    profileUrl: 'https://www.linkedin.com/in/nilesh-patel-3aa24040/',
    sortOrder: 1,
    isVisible: true,
  },
  {
    fullName: 'Aadi Patel',
    title: 'CE of JSR Hotels',
    bio: 'Spearheading operational excellence and brand standards for elite hospitality experiences.',
    profileUrl: 'https://www.linkedin.com/in/aadi-patel-52388023b/',
    sortOrder: 2,
    isVisible: true,
  },
];

export const defaultCultureSections = [
  {
    title: 'Excellence',
    body: 'We never settle for average. From meticulously curated details to proactive service, true luxury is built on continuous improvement and setting new benchmarks.',
    icon: '✨',
    sortOrder: 1,
    isVisible: true,
  },
  {
    title: 'Integrity',
    body: 'Transparency and trust are the cornerstones of our philosophy. We build long-term value through responsibility and clear communication with guests and partners.',
    icon: '🤝',
    sortOrder: 2,
    isVisible: true,
  },
  {
    title: 'Guest-Centricity',
    body: 'Every decision is shaped by guest experience. We empower teams to anticipate needs and create memorable stays that inspire loyalty.',
    icon: '💎',
    sortOrder: 3,
    isVisible: true,
  },
];

export const defaultAwardSections = [
  {
    title: '2025 Best of The Best Award',
    body: 'Awarded for top-tier guest satisfaction and flawless operational excellence across flagship properties.',
    icon: '🏆',
    sortOrder: 1,
    isVisible: true,
  },
  {
    title: 'Global Hospitality Platinum',
    body: 'Recognizing JSR Hotels among the top global brands for luxury guest experiences and service consistency.',
    icon: '🌟',
    sortOrder: 2,
    isVisible: true,
  },
  {
    title: 'Excellence in Architecture',
    body: 'Honoring design leadership, sustainable construction practices, and standout interior concepts.',
    icon: '🏅',
    sortOrder: 3,
    isVisible: true,
  },
];

export const defaultBrands = ['Hilton', 'Marriott', 'Holiday Inn', 'Hyatt', 'Wyndham', 'Accor'];

export const defaultContactInfo = {
  heading: 'Contact Us',
  introText: "We're here to assist you with any inquiries or investment opportunities. Please feel free to reach out.",
  address: '123 Luxury Avenue, Beverly Hills, CA 90210',
  investmentEmail: 'invest@jsrhotels.com',
  investmentPhone: '+1 (555) 987-6543',
  generalEmail: 'info@jsrhotels.com',
  generalPhone: '+1 (555) 123-4567',
};

export const defaultSocialLinks = [
  { platform: 'Facebook', url: '#', iconKey: 'facebook', sortOrder: 1, isVisible: true },
  { platform: 'Instagram', url: 'https://www.instagram.com/jsrhotels?igsh=cjhmODQ3MmJiczdm', iconKey: 'instagram', sortOrder: 2, isVisible: true },
  { platform: 'LinkedIn', url: '#', iconKey: 'linkedin', sortOrder: 3, isVisible: true },
];

export const defaultLegalDocuments = [
  {
    type: 'PRIVACY',
    title: 'Privacy Policy',
    content: 'At JSR Hotels, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.',
  },
  {
    type: 'TERMS',
    title: 'Terms & Conditions',
    content: 'These Terms and Conditions constitute a legally binding agreement made between you and JSR Hotels concerning your access to and use of this website.',
  },
];
