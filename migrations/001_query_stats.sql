-- VibeCar Query Stats Cache
-- Migration: 001_query_stats.sql
-- Created: 2026-01-04

-- Tabella principale per caching aggregati
CREATE TABLE IF NOT EXISTS query_stats (
  -- Primary key: hash della query
  query_hash VARCHAR(64) PRIMARY KEY,

  -- Filtri originali (JSON per debug/audit)
  filters_json JSONB NOT NULL,

  -- Sorgente dati
  source VARCHAR(50) NOT NULL DEFAULT 'autoscout24',

  -- Statistiche aggregate
  n_listings INTEGER NOT NULL,
  p25 INTEGER NOT NULL,  -- 25th percentile
  p50 INTEGER NOT NULL,  -- 50th percentile (mediana)
  p75 INTEGER NOT NULL,  -- 75th percentile
  min_clean INTEGER NOT NULL,  -- min dopo outlier removal
  max_clean INTEGER NOT NULL,  -- max dopo outlier removal
  iqr_ratio DECIMAL(5,4) NOT NULL,  -- IQR/P50 per misurare variabilita

  -- Breakdown venditore (informativo)
  n_dealers INTEGER DEFAULT 0,
  n_private INTEGER DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Indici per query
  CONSTRAINT valid_percentiles CHECK (p25 <= p50 AND p50 <= p75),
  CONSTRAINT valid_range CHECK (min_clean <= max_clean),
  CONSTRAINT valid_iqr CHECK (iqr_ratio >= 0)
);

-- Indice per pulizia cache scaduta
CREATE INDEX IF NOT EXISTS idx_query_stats_expires
  ON query_stats(expires_at);

-- Indice per source
CREATE INDEX IF NOT EXISTS idx_query_stats_source
  ON query_stats(source);

-- Funzione per generare hash della query
-- (da usare lato applicazione, ma utile per debug)
COMMENT ON TABLE query_stats IS
  'Cache aggregati valutazioni auto. TTL default 24h. Solo statistiche, no contenuti annunci.';

-- Tabella per tracking rate limit (opzionale)
CREATE TABLE IF NOT EXISTS scrape_log (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per analytics
CREATE INDEX IF NOT EXISTS idx_scrape_log_created
  ON scrape_log(created_at DESC);

-- Cleanup automatico log vecchi (> 7 giorni)
-- Da eseguire periodicamente via cron o scheduled function
-- DELETE FROM scrape_log WHERE created_at < NOW() - INTERVAL '7 days';
