-- Google Maps Scraper Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Searches table - stores search queries and metadata
CREATE TABLE IF NOT EXISTS searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  results_count INTEGER DEFAULT 0,
  error TEXT,
  CONSTRAINT status_check CHECK (status IN ('pending', 'running', 'completed', 'failed'))
);

-- Results table - stores scraped business data
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  website TEXT,
  rating NUMERIC(2, 1),
  review_count INTEGER,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  data JSONB NOT NULL, -- Full business object
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status);
CREATE INDEX IF NOT EXISTS idx_results_search_id ON results(search_id);
CREATE INDEX IF NOT EXISTS idx_results_website ON results(website);
CREATE INDEX IF NOT EXISTS idx_results_rating ON results(rating DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policies for single-user mode (allow all operations)
-- IMPORTANT: For multi-user, you'd add auth.uid() checks here
CREATE POLICY "Allow all operations on searches" ON searches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on results" ON results
  FOR ALL USING (true) WITH CHECK (true);

-- Optional: Function to automatically update completed_at when status changes to 'completed'
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_completed_at
  BEFORE UPDATE ON searches
  FOR EACH ROW
  EXECUTE FUNCTION update_completed_at();
