export type PortfolioStatus = 'UNDER_CONSTRUCTION' | 'COMPLETED';

export interface MediaAsset {
  id: string;
  url: string;
  originalName?: string;
}

export interface HomeBlock {
  id: string;
  type: string;
  heading?: string | null;
  subheading?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  payload?: Record<string, unknown> | null;
  imageAsset?: MediaAsset | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface AboutSection {
  id: string;
  title: string;
  body: string;
  imageAsset?: MediaAsset | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  imageAsset?: MediaAsset | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface TeamMember {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  profileUrl?: string | null;
  imageAsset?: MediaAsset | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface HotelBrand {
  id: string;
  name: string;
  logoAsset?: MediaAsset | null;
  isActive: boolean;
  sortOrder: number;
}

export interface PropertyImage {
  id: string;
  assetId: string;
  altText?: string | null;
  sortOrder: number;
  isCover: boolean;
  asset?: MediaAsset;
}

export interface PortfolioProperty {
  id: string;
  brandId: string;
  brand?: HotelBrand;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string | null;
  status: PortfolioStatus;
  isVisible: boolean;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  keyInfo?: Record<string, unknown> | null;
  coverImageAsset?: MediaAsset | null;
  coverImageAssetId?: string | null;
  sortOrder: number;
  images?: PropertyImage[];
}

export interface ContactInfo {
  id: string;
  heading: string;
  introText: string;
  address: string;
  investmentEmail?: string | null;
  investmentPhone?: string | null;
  generalEmail: string;
  generalPhone: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  iconKey?: string | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface LegalDocument {
  id: string;
  type: 'PRIVACY' | 'TERMS';
  title: string;
  content: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  brandName: string;
  footerTagline?: string | null;
  logoAsset?: MediaAsset | null;
}
