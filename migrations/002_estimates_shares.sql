-- Migration: 002_estimates_shares
-- Description: Create estimates and shares tables for viral attribution tracking
-- Created: 2026-01-04

-- ============================================
-- ESTIMATES TABLE
-- Stores every estimate with attribution data
-- ============================================

CREATE TABLE IF NOT EXISTS estimates (
  id SERIAL PRIMARY KEY,
  estimate_id UUID NOT NULL UNIQUE,
  anon_id VARCHAR(36) NOT NULL,
  query_hash VARCHAR(64) NOT NULL,
  filters_json JSONB NOT NULL,
  n_total INTEGER NOT NULL,
  n_used INTEGER NOT NULL,
  confidence VARCHAR(10) NOT NULL CHECK (confidence IN ('alta', 'media', 'bassa')),
  cached BOOLEAN NOT NULL DEFAULT FALSE,
  p25 INTEGER NOT NULL,
  p50 INTEGER NOT NULL,
  p75 INTEGER NOT NULL,
  dealer_price INTEGER NOT NULL,
  dealer_gap INTEGER NOT NULL,
  iqr_ratio DECIMAL(5,4) NOT NULL,
  relaxations JSONB,
  origin_ref VARCHAR(20) DEFAULT 'organic',
  origin_sid UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_estimates_anon_id ON estimates(anon_id);
CREATE INDEX IF NOT EXISTS idx_estimates_origin_sid ON estimates(origin_sid);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at);
CREATE INDEX IF NOT EXISTS idx_estimates_query_hash ON estimates(query_hash);

-- ============================================
-- SHARES TABLE
-- Tracks share events linked to estimates
-- ============================================

CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  share_id UUID NOT NULL UNIQUE,
  estimate_id UUID NOT NULL REFERENCES estimates(estimate_id),
  anon_id VARCHAR(36) NOT NULL,
  share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('link', 'image', 'whatsapp')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shares_estimate_id ON shares(estimate_id);
CREATE INDEX IF NOT EXISTS idx_shares_anon_id ON shares(anon_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at);
