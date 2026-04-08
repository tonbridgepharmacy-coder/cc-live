// =============================================
// Clarke & Coleman Pharmacy — Type Definitions
// =============================================

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  procedure?: string;
  benefits?: string[];
  pricing?: string;
  bannerImage?: string;
  galleryImages?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vaccine {
  id: string;
  title: string;
  slug: string;
  realPrice: number;
  crossPrice?: number;
  about: string;
  benefits: string[];
  riskIfDelayed?: string;
  bannerImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  ogImage?: string;
  author: string;
  readingTime: number;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category?: string;
  order: number;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  slug: string;
  department: string;
  type: 'full-time' | 'part-time' | 'contract';
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  isActive: boolean;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  cvUrl?: string;
  resumeLink?: string;
  coverLetter?: string;
  createdAt: string;
}

export interface SiteSettings {
  clinicName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  googleMapEmbed?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}
