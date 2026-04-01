import type {
  AboutSection,
  ContentPageSection,
  ContactInfo,
  HomeBlock,
  LegalDocument,
  ServiceItem,
  SiteSetting,
  SocialLink,
  TeamMember,
  HotelBrand,
  PortfolioProperty,
} from '../types/content';

export const fallbackSiteSetting: SiteSetting = {
  id: 'main',
  brandName: 'JSR Hotels',
  footerTagline: 'Experience luxury, comfort, and an unforgettable journey. Your premium destination awaits.',
  logoAsset: null,
};

export const fallbackHomeBlocks: HomeBlock[] = [
  {
    id: 'hero',
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
    id: 'pillars',
    type: 'pillars',
    heading: 'Our Core Pillars',
    subheading: 'What We Do',
    isVisible: true,
    sortOrder: 2,
    payload: {
      items: [
        {
          icon: 'TrendingUp',
          title: 'Investment',
          desc: 'Identifying sound opportunities and managing hospitality investments strategically for maximized ROI and sustainable growth.',
        },
        {
          icon: 'Building2',
          title: 'Development',
          desc: 'From architectural design to construction, executing premium concepts perfectly at every phase of the pipeline.',
        },
        {
          icon: 'Users',
          title: 'Management',
          desc: 'Operating with excellence through strategic brand partnerships and uncompromised, award-winning luxury service.',
        },
      ],
    },
  },
  {
    id: 'intro',
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
    id: 'stats',
    type: 'stats',
    isVisible: true,
    sortOrder: 4,
    payload: {
      items: [
        { value: '12', label: 'Hotels' },
        { value: '4', label: 'States' },
        { value: '2,500+', label: 'Rooms' },
        { value: '15+', label: 'Awards' },
      ],
    },
  },
  {
    id: 'featured',
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
    id: 'leadership',
    type: 'leadership',
    heading:
      'Like a well-planned hotel, solid investments in hospitality today are the bedrock of a prosperous future, offering a promising path to financial success and unmatched luxury.',
    description: '- Nilesh Patel, CEO & Founder | JSR Hotels',
    isVisible: true,
    sortOrder: 6,
    payload: { imageUrl: '/nilesh.jpeg' },
  },
  {
    id: 'news',
    type: 'news',
    heading: 'Latest Updates',
    isVisible: true,
    sortOrder: 7,
    payload: {
      items: [
        {
          date: 'Oct 24, 2025',
          title: 'JSR Breaks Ground on New Development',
          desc: 'Our latest coastal resort project officially begins construction, expanding our luxury footprint globally.',
        },
        {
          date: 'Sep 15, 2025',
          title: 'Industry Leaders Seminar 2025',
          desc: 'CEO Nilesh Patel speaks on the resilience and future of the American hospitality spirit.',
        },
      ],
    },
  },
  {
    id: 'accolades',
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
    id: 'newsletter',
    type: 'newsletter',
    heading: 'Stay Connected',
    description: 'Sign up for our newsletter to receive updates and exclusive investment opportunities.',
    isVisible: true,
    sortOrder: 9,
  },
];

export const fallbackAboutSections: AboutSection[] = [
  {
    id: 'about-heritage',
    title: 'Our Heritage',
    body: 'Founded with a vision to redefine excellence in the hospitality sector, JSR Hotels has consistently set the benchmark for luxury and elegance.',
    imageAsset: null,
    isVisible: true,
    sortOrder: 1,
  },
];

export const fallbackCultureSections: ContentPageSection[] = [
  {
    id: 'culture-1',
    pageKey: 'CULTURE',
    title: 'Excellence',
    body: 'We never settle for average. We constantly refine service standards to deliver premium hospitality in every interaction.',
    icon: '✨',
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'culture-2',
    pageKey: 'CULTURE',
    title: 'Integrity',
    body: 'Transparency and trust guide every decision, building long-term value for guests, teams, and partners.',
    icon: '🤝',
    isVisible: true,
    sortOrder: 2,
  },
  {
    id: 'culture-3',
    pageKey: 'CULTURE',
    title: 'Guest-Centricity',
    body: 'Every operational step is shaped by guest experience and personalized service.',
    icon: '💎',
    isVisible: true,
    sortOrder: 3,
  },
];

export const fallbackAwardSections: ContentPageSection[] = [
  {
    id: 'award-1',
    pageKey: 'AWARDS',
    title: '2025 Best of The Best Award',
    body: 'Recognized for exceptional guest satisfaction and consistent operational excellence.',
    icon: '🏆',
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'award-2',
    pageKey: 'AWARDS',
    title: 'Global Hospitality Platinum',
    body: 'Acknowledged among leading global hospitality brands for luxury service delivery.',
    icon: '🌟',
    isVisible: true,
    sortOrder: 2,
  },
  {
    id: 'award-3',
    pageKey: 'AWARDS',
    title: 'Excellence in Architecture',
    body: 'Honored for design leadership, sustainability, and premium interior execution.',
    icon: '🏅',
    isVisible: true,
    sortOrder: 3,
  },
];

export const fallbackTeamMembers: TeamMember[] = [
  {
    id: 'team-1',
    fullName: 'Nilesh Patel',
    title: 'CEO & Founder | JSR Hotels | Hospitality & Real Estate Growth',
    bio: "The driving force behind JSR Hotels' strategic expansion, mastering real estate investments and visionary architectural capabilities.",
    profileUrl: 'https://www.linkedin.com/in/nilesh-patel-3aa24040/',
    imageAsset: { id: 'fallback-nilesh', url: '/nilesh.jpeg' },
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'team-2',
    fullName: 'Aadi Patel',
    title: 'CE of JSR Hotels',
    bio: 'Spearheading operational excellence and brand standards to ensure every JSR property remains the pinnacle of guest experience.',
    profileUrl: 'https://www.linkedin.com/in/aadi-patel-52388023b/',
    imageAsset: { id: 'fallback-aadi', url: '/aadi.png' },
    isVisible: true,
    sortOrder: 2,
  },
];

export const fallbackServices: ServiceItem[] = [
  {
    id: 'service-1',
    title: 'Hospitality Investment',
    description:
      'Identifying high-yield opportunities and managing investments thoughtfully with dedicated capital markets guidance and asset management.',
    icon: '📈',
    isVisible: true,
    sortOrder: 1,
  },
  {
    id: 'service-2',
    title: 'Property Development',
    description:
      'End-to-end architectural execution, project management, and premium interior design for ground-up developments and renovations.',
    icon: '🏗️',
    isVisible: true,
    sortOrder: 2,
  },
  {
    id: 'service-3',
    title: 'Operations & Management',
    description:
      'Comprehensive, award-winning operational leadership ensuring uncompromised guest experiences and maximized property profitability.',
    icon: '🤝',
    isVisible: true,
    sortOrder: 3,
  },
  {
    id: 'service-4',
    title: 'Brand Strategy',
    description:
      'Strategic partnerships with leading global hospitality flags to secure premium market positioning and long-term brand equity.',
    icon: '💎',
    isVisible: true,
    sortOrder: 4,
  },
];

export const fallbackBrands: HotelBrand[] = [
  { id: 'brand-hilton', name: 'Hilton', isActive: true, sortOrder: 1 },
  { id: 'brand-marriott', name: 'Marriott', isActive: true, sortOrder: 2 },
  { id: 'brand-holiday-inn', name: 'Holiday Inn', isActive: true, sortOrder: 3 },
  { id: 'brand-hyatt', name: 'Hyatt', isActive: true, sortOrder: 4 },
  { id: 'brand-wyndham', name: 'Wyndham', isActive: true, sortOrder: 5 },
  { id: 'brand-accor', name: 'Accor', isActive: true, sortOrder: 6 },
];

export const fallbackProperties: PortfolioProperty[] = [
  {
    id: 'property-1',
    brandId: 'brand-hilton',
    brand: fallbackBrands[0],
    title: 'The Grand Suite',
    slug: 'the-grand-suite',
    shortDescription: 'Breathtaking city views with expansive living spaces and luxury amenities.',
    fullDescription: 'A premium city hotel development designed around high-end hospitality experiences.',
    status: 'UNDER_CONSTRUCTION',
    isVisible: true,
    addressLine1: '1200 Sunset Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90026',
    country: 'USA',
    sortOrder: 1,
    images: [{ id: 'img1', assetId: 'asset1', sortOrder: 1, isCover: true, asset: { id: 'asset1', url: '/room-demo.png' } }],
  },
  {
    id: 'property-2',
    brandId: 'brand-holiday-inn',
    brand: fallbackBrands[2],
    title: 'Ocean View Retreat',
    slug: 'ocean-view-retreat',
    shortDescription: 'Wake up to the sound of waves in this serene, beautifully appointed setting.',
    fullDescription: 'A finished beachfront property delivering premium comfort and breathtaking sea views.',
    status: 'COMPLETED',
    isVisible: true,
    addressLine1: '88 Shoreline Drive',
    city: 'Miami',
    state: 'FL',
    zipCode: '33139',
    country: 'USA',
    sortOrder: 2,
    images: [{ id: 'img2', assetId: 'asset2', sortOrder: 1, isCover: true, asset: { id: 'asset2', url: '/suite-ocean.png' } }],
  },
];

export const fallbackContact: ContactInfo = {
  id: 'contact-main',
  heading: 'Contact Us',
  introText: "We're here to assist you with any inquiries or investment opportunities. Please feel free to reach out.",
  address: '123 Luxury Avenue, Beverly Hills, CA 90210',
  investmentEmail: 'invest@jsrhotels.com',
  investmentPhone: '+1 (555) 987-6543',
  generalEmail: 'info@jsrhotels.com',
  generalPhone: '+1 (555) 123-4567',
};

export const fallbackSocialLinks: SocialLink[] = [
  { id: 'social-fb', platform: 'Facebook', url: '#', iconKey: 'facebook', isVisible: true, sortOrder: 1 },
  {
    id: 'social-ig',
    platform: 'Instagram',
    url: 'https://www.instagram.com/jsrhotels?igsh=cjhmODQ3MmJiczdm',
    iconKey: 'instagram',
    isVisible: true,
    sortOrder: 2,
  },
  { id: 'social-li', platform: 'LinkedIn', url: '#', iconKey: 'linkedin', isVisible: true, sortOrder: 3 },
];

export const fallbackLegalDocuments: Record<'PRIVACY' | 'TERMS', LegalDocument> = {
  PRIVACY: {
    id: 'privacy',
    type: 'PRIVACY',
    title: 'Privacy Policy',
    content:
      'At JSR Hotels, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner.',
    updatedAt: new Date().toISOString(),
  },
  TERMS: {
    id: 'terms',
    type: 'TERMS',
    title: 'Terms & Conditions',
    content:
      'These Terms and Conditions constitute a legally binding agreement made between you and JSR Hotels concerning your access to and use of this website.',
    updatedAt: new Date().toISOString(),
  },
};

export const noImagePlaceholder = '/no-image.svg';
