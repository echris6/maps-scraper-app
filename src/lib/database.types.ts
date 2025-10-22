// Auto-generated Supabase types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      searches: {
        Row: {
          id: string
          query: string
          filters: Json
          status: string
          created_at: string
          completed_at: string | null
          results_count: number
          error: string | null
        }
        Insert: {
          id?: string
          query: string
          filters: Json
          status?: string
          created_at?: string
          completed_at?: string | null
          results_count?: number
          error?: string | null
        }
        Update: {
          id?: string
          query?: string
          filters?: Json
          status?: string
          created_at?: string
          completed_at?: string | null
          results_count?: number
          error?: string | null
        }
      }
      results: {
        Row: {
          id: string
          search_id: string
          business_name: string
          phone: string | null
          address: string | null
          website: string | null
          rating: number | null
          review_count: number | null
          latitude: number | null
          longitude: number | null
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          search_id: string
          business_name: string
          phone?: string | null
          address?: string | null
          website?: string | null
          rating?: number | null
          review_count?: number | null
          latitude?: number | null
          longitude?: number | null
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          search_id?: string
          business_name?: string
          phone?: string | null
          address?: string | null
          website?: string | null
          rating?: number | null
          review_count?: number | null
          latitude?: number | null
          longitude?: number | null
          data?: Json
          created_at?: string
        }
      }
    }
  }
}
