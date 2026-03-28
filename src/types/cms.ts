/** Typed shapes for each site_content slug's JSON `content` field. */

export interface HeroContent {
  title: string;
  eyebrow: string;
  subtitle: string;
  backgroundImage: string;
  trust: string[];
  /** Whether the search bar is visible in the hero. Defaults to true. */
  showSearch?: boolean;
}

export interface AboutContent {
  image: string;
  label: string;
  title: string;
  role: string;
  paragraphs: string[];
  certifications: string[];
}

export interface StatsContent {
  items: [string, string][];
}

export interface CtaContent {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  trust: string[];
}

export interface FooterContent {
  description: string;
  phone: string;
  email: string;
  address: string;
  socials: string[];
  legal: string[];
  /** IDFPR managing broker line under Equal Housing (e.g. "Name · IL Managing Broker Lic. …"). Empty uses built-in default. */
  licenseLine?: string;
}

export interface HeaderContent {
  /** URL to logo image; if empty, brandText is shown instead */
  logoUrl: string;
  /** Fallback brand name text when no logo is set */
  brandText: string;
  /** Nav links as [label, href] pairs */
  navLinks: [string, string][];
}

export interface FeaturedListingData {
  title: string;
  address: string;
  price: string;
  specs: string[];
  image: string;
  href: string;
}

export type CmsSlug = 'hero' | 'about' | 'stats' | 'cta' | 'footer' | 'header';

export type CmsContentMap = {
  hero: HeroContent;
  about: AboutContent;
  stats: StatsContent;
  cta: CtaContent;
  footer: FooterContent;
  header: HeaderContent;
};
