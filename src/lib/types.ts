// Core business data type matching Google Maps scraper output
export interface Business {
  id: string;
  title: string;
  phone: string;
  website: string;
  email: string;
  address: string;
  complete_address: string;
  category: string;
  review_rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
  cid: string;
  status: string;
  open_hours: string;
  popular_times: string;
  plus_code: string;
  reviews_per_rating: string;
  descriptions: string;
  reviews_link: string;
  thumbnail: string;
  timezone: string;
  price_range: string;
  data_id: string;
  images: string;
  reservations: string;
  order_online: string;
  menu: string;
  owner: string;
  about: string;
  user_reviews: string;
}

// Search filters
export interface SearchFilters {
  noWebsite?: boolean;
  minRating?: number;
  minReviews?: number;
  depth?: number;
  extractEmails?: boolean;
}

// Search query with filters
export interface SearchQuery {
  query: string;
  filters: SearchFilters;
}

// Job status
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Scraping job
export interface ScrapeJob {
  id: string;
  query: string;
  filters: SearchFilters;
  status: JobStatus;
  progress: number;
  resultsCount: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Database types (Supabase)
export interface SearchRecord {
  id: string;
  query: string;
  filters: SearchFilters;
  status: JobStatus;
  created_at: string;
  completed_at?: string;
  results_count: number;
  error?: string;
}

export interface ResultRecord {
  id: string;
  search_id: string;
  business_name: string;
  phone?: string;
  address?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  data: Business; // Full business object as JSONB
}

// Export format types
export type ExportFormat = 'csv' | 'xlsx' | 'json';

// View mode for results
export type ViewMode = 'grid' | 'table' | 'list';

// Sort options
export type SortField = 'rating' | 'reviews' | 'name';
export type SortOrder = 'asc' | 'desc';
