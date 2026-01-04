# VibeCar Analytics Documentation

## Overview

VibeCar utilizza uno stack analytics privacy-first per monitorare crescita, viralità e qualità del prodotto.

**Stack:**
- **Plausible** - Web analytics (no cookies, GDPR compliant)
- **PostHog** - Event tracking dettagliato
- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking
- **Neon Postgres** - Database logging per viral attribution

---

## Identity & Attribution

### Anonymous ID (`anon_id`)
- UUID v4 generato al primo accesso
- Persistente in localStorage (`vibecar_anon_id`)
- Privacy-safe: non collegabile a identità reali

### Estimate ID (`estimate_id`)
- UUID v4 generato per ogni valutazione
- Usato per collegare eventi e share links
- Permette tracking del funnel completo

### Viral Attribution
- Share links includono `?ref=share&sid=<estimate_id>`
- `origin_ref`: fonte della visita (`organic`, `share`, `utm`)
- `origin_sid`: estimate_id sorgente se da share

---

## Events Tracked

### Plausible Goals (Web Analytics)

| Goal | Trigger | Props |
|------|---------|-------|
| `estimate_completed` | Valutazione completata | `confidence`, `cached` |
| `share_clicked` | Click su bottone share | `type` |
| `share_image_downloaded` | Download immagine social | - |

### PostHog Events (Detailed Analytics)

Tutti gli eventi includono: `anon_id`, `estimate_id`, `origin_ref`, `origin_sid`, `timestamp`

| Event | Trigger | Properties |
|-------|---------|------------|
| `start_estimate` | Submit form valutazione | `brand`, `model`, `year`, `km_range`, `fuel`, `gearbox` |
| `estimate_completed` | Risultato mostrato | `brand`, `model`, `year`, `confidence`, `n_used`, `n_total`, `cached`, `p25_range`, `p50_range`, `p75_range`, `dealer_price_range`, `dealer_gap`, `iqr_ratio`, `fallback_step`, `time_to_result_ms` |
| `estimate_cached` | Risultato da cache | `cached: true` |
| `estimate_failed` | Nessun risultato | `brand`, `model`, `year`, `reason` |
| `fallback_triggered` | Ricerca ampliata | `step`, `brand`, `model` |
| `share_clicked` | Click share button | `type`, `brand`, `model`, `year`, `confidence` |
| `share_completed` | Share effettuato | `type`, `brand`, `model` |
| `recalculation_clicked` | Click "Ricalcola" | `brand`, `model`, `year` |
| `viral_visit` | Visita da link condiviso | `source`, `source_estimate_id`, `referrer_domain` |
| `utm_visit` | Visita con UTM params | `utm_source`, `utm_medium` |
| `error_occurred` | Errore client | `error`, context |

---

## Database Schema

### `estimates` Table

Registra ogni valutazione con dati di attribution.

```sql
CREATE TABLE estimates (
  id SERIAL PRIMARY KEY,
  estimate_id UUID NOT NULL UNIQUE,
  anon_id VARCHAR(36) NOT NULL,
  query_hash VARCHAR(64) NOT NULL,
  filters_json JSONB NOT NULL,
  n_total INTEGER NOT NULL,
  n_used INTEGER NOT NULL,
  confidence VARCHAR(10) NOT NULL,
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
```

### `shares` Table

Traccia gli eventi di condivisione.

```sql
CREATE TABLE shares (
  id SERIAL PRIMARY KEY,
  share_id UUID NOT NULL UNIQUE,
  estimate_id UUID NOT NULL REFERENCES estimates(estimate_id),
  anon_id VARCHAR(36) NOT NULL,
  share_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## SQL Query Examples

### K-Factor Calculation

```sql
-- K = i × c
-- i = shares per estimate
-- c = conversion rate (viral visits that complete estimate)

WITH metrics AS (
  SELECT
    -- Total estimates
    (SELECT COUNT(*) FROM estimates WHERE created_at >= NOW() - INTERVAL '7 days') as total_estimates,

    -- Estimates from shares
    (SELECT COUNT(*) FROM estimates
     WHERE origin_ref = 'share'
     AND created_at >= NOW() - INTERVAL '7 days') as viral_estimates,

    -- Total shares
    (SELECT COUNT(*) FROM shares WHERE created_at >= NOW() - INTERVAL '7 days') as total_shares
)
SELECT
  total_estimates,
  viral_estimates,
  total_shares,
  -- i = shares per estimate
  ROUND(total_shares::numeric / NULLIF(total_estimates, 0), 3) as invites_per_user,
  -- c = viral conversion rate (assume 50% of shares lead to viral visits)
  ROUND(viral_estimates::numeric / NULLIF(total_shares * 0.5, 0), 3) as conversion_rate,
  -- K-factor
  ROUND(
    (total_shares::numeric / NULLIF(total_estimates, 0)) *
    (viral_estimates::numeric / NULLIF(total_shares * 0.5, 0)),
    3
  ) as k_factor
FROM metrics;
```

### Daily Active Valuations

```sql
SELECT
  DATE(created_at) as day,
  COUNT(*) as total_estimates,
  COUNT(CASE WHEN confidence = 'alta' THEN 1 END) as alta,
  COUNT(CASE WHEN confidence = 'media' THEN 1 END) as media,
  COUNT(CASE WHEN confidence = 'bassa' THEN 1 END) as bassa,
  COUNT(CASE WHEN cached = true THEN 1 END) as cached,
  ROUND(AVG(n_used), 1) as avg_samples
FROM estimates
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### Share Rate by Day

```sql
SELECT
  DATE(e.created_at) as day,
  COUNT(DISTINCT e.estimate_id) as estimates,
  COUNT(DISTINCT s.share_id) as shares,
  ROUND(COUNT(DISTINCT s.share_id)::numeric / NULLIF(COUNT(DISTINCT e.estimate_id), 0) * 100, 1) as share_rate_pct
FROM estimates e
LEFT JOIN shares s ON e.estimate_id = s.estimate_id
WHERE e.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(e.created_at)
ORDER BY day DESC;
```

### Viral Attribution Chain

```sql
-- Trova la catena virale: chi ha generato chi
WITH RECURSIVE viral_chain AS (
  -- Base: stime organiche
  SELECT
    estimate_id,
    anon_id,
    origin_sid,
    1 as depth,
    ARRAY[estimate_id] as chain
  FROM estimates
  WHERE origin_ref = 'organic'

  UNION ALL

  -- Ricorsione: stime generate da share
  SELECT
    e.estimate_id,
    e.anon_id,
    e.origin_sid,
    vc.depth + 1,
    vc.chain || e.estimate_id
  FROM estimates e
  JOIN viral_chain vc ON e.origin_sid = vc.estimate_id
  WHERE vc.depth < 10 -- limite profondità
)
SELECT
  depth,
  COUNT(*) as estimates_at_depth,
  COUNT(DISTINCT anon_id) as unique_users
FROM viral_chain
GROUP BY depth
ORDER BY depth;
```

### Repeat Users

```sql
SELECT
  COUNT(DISTINCT anon_id) as total_users,
  COUNT(DISTINCT CASE WHEN estimate_count > 1 THEN anon_id END) as repeat_users,
  ROUND(
    COUNT(DISTINCT CASE WHEN estimate_count > 1 THEN anon_id END)::numeric /
    NULLIF(COUNT(DISTINCT anon_id), 0) * 100,
    1
  ) as repeat_rate_pct
FROM (
  SELECT anon_id, COUNT(*) as estimate_count
  FROM estimates
  GROUP BY anon_id
) user_counts;
```

### Cache Hit Rate

```sql
SELECT
  DATE(created_at) as day,
  COUNT(*) as total,
  COUNT(CASE WHEN cached = true THEN 1 END) as cached,
  ROUND(COUNT(CASE WHEN cached = true THEN 1 END)::numeric / COUNT(*) * 100, 1) as cache_hit_pct
FROM estimates
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

### Top Searched Models

```sql
SELECT
  filters_json->>'brand' as brand,
  filters_json->>'model' as model,
  COUNT(*) as searches,
  ROUND(AVG(p50)) as avg_p50,
  ROUND(AVG(dealer_gap)) as avg_dealer_gap
FROM estimates
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY filters_json->>'brand', filters_json->>'model'
ORDER BY searches DESC
LIMIT 20;
```

---

## Funnel Definition

```
Home → Start Estimate → Estimate Completed → Share Clicked → Share Completed
```

**Steps:**
1. `start_estimate` - Utente inizia valutazione
2. `estimate_completed` - Valutazione completata con successo
3. `share_clicked` - Utente clicca su condividi
4. `share_completed` - Condivisione effettuata

---

## Key Metrics

### Share Rate
```
share_clicked / estimate_completed × 100
```
Percentuale di utenti che condividono la valutazione.

### Cache Hit Rate
```
estimate_cached / estimate_completed × 100
```
Percentuale di stime servite da cache (risparmio scraping).

### Fallback Rate
```
fallback_triggered / estimate_completed × 100
```
Percentuale di stime che richiedono ricerca ampliata.

### Time to Result (P50)
```
percentile(time_to_result_ms, 50)
```
Tempo mediano dalla submit alla visualizzazione risultato.

### Confidence Distribution
```
GROUP BY confidence → count
```
Distribuzione affidabilità: alta/media/bassa.

---

## Viral Metrics

### K-Factor (Viral Coefficient)

```
K = i × c
```

Dove:
- `i` = inviti medi per utente = `share_completed / estimate_completed`
- `c` = conversion rate = `estimate_completed[source=share] / viral_visit`

**Come misurarlo:**
1. Link condivisi includono `?ref=share&sid=<estimate_id>`
2. `viral_visit` traccia arrivi da share
3. Se `viral_visit` → `estimate_completed`, è una conversione virale
4. `origin_sid` collega il nuovo estimate al sorgente

**Target K-factor:**
- K < 1: Crescita sub-virale (serve paid acquisition)
- K = 1: Sostenibile
- K > 1: Crescita virale organica

### Repeat Usage Rate
```
users with >1 estimate / total users
```
Tracciabile via `anon_id` nel database.

---

## Privacy & Data Minimization

### NO PII Collected

| Non tracciamo | Tracciamo invece |
|---------------|------------------|
| Email | - |
| Nome | - |
| IP address | - |
| User ID | Anonymous UUID |
| Prezzo esatto | Range (es. "15-20k") |
| KM esatto | Range (es. "50-100k") |
| Targa/VIN | - |

### Privacy Measures

1. **Plausible**: No cookies, no tracking pixels, aggregated only
2. **PostHog**:
   - `persistence: 'memory'` (no cookies)
   - `autocapture: false` (solo eventi manuali)
   - `sanitize_properties` rimuove PII
3. **Sentry**: `beforeSend` rimuove IP/email
4. **Database**: Solo UUID anonimi, no dati personali
5. **Nessun cookie banner necessario**: tutto anonimo

### Data Anonymization

```typescript
// KM → Range
function getKmRange(km: number): string {
  if (km < 10000) return '0-10k';
  if (km < 30000) return '10-30k';
  // ...
}

// Prezzo → Range
function getPriceRange(price: number): string {
  if (price < 5000) return '0-5k';
  if (price < 10000) return '5-10k';
  // ...
}
```

---

## Setup Checklist

### Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...@neon.tech/vibecar
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=vibecar.it
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=vibecar
```

### Verification Checklist

- [ ] Plausible dashboard mostra page views
- [ ] PostHog riceve eventi `start_estimate`
- [ ] PostHog riceve eventi `estimate_completed`
- [ ] Eventi contengono `anon_id` e `estimate_id`
- [ ] Share events tracciati correttamente
- [ ] Link condivisi includono `?ref=share&sid=...`
- [ ] Sentry cattura errori (test con `throw new Error`)
- [ ] Vercel Analytics attivo su dashboard
- [ ] Nessun PII nei payload (verificare in PostHog)
- [ ] Database tables `estimates` e `shares` create

---

## PostHog Dashboard Setup

### Recommended Insights

1. **Daily Active Valuations**
   - Event: `estimate_completed`
   - Breakdown: `confidence`

2. **Share Funnel**
   - Steps: `estimate_completed` → `share_clicked` → `share_completed`

3. **Cache Efficiency**
   - Event: `estimate_completed`
   - Filter: `cached = true`
   - Compare: total vs cached

4. **Viral Tracking**
   - Event: `viral_visit`
   - Breakdown: `source_estimate_id`

5. **Error Rate**
   - Event: `estimate_failed`
   - Breakdown: `reason`

6. **Attribution Sources**
   - Event: `estimate_completed`
   - Breakdown: `origin_ref`

---

## Files

| File | Description |
|------|-------------|
| `src/lib/analytics.ts` | Core analytics module |
| `src/components/AnalyticsProvider.tsx` | React provider |
| `sentry.client.config.ts` | Sentry client config |
| `sentry.server.config.ts` | Sentry server config |
| `sentry.edge.config.ts` | Sentry edge config |
| `migrations/002_estimates_shares.sql` | DB schema for tracking |
