# VibeCar Context Handover

**Data**: 2026-01-04
**Stato**: MVP Hardening completato, DB Neon collegato via MCP

---

## Cosa è stato fatto

### 1. Analisi Tecnica Verificata (A/B Testing su AutoScout24.it)

**Filtri funzionanti via URL:**
- `fregfrom/fregto` (anno)
- `kmfrom/kmto` (chilometraggio)
- `fuel` (B=benzina, D=diesel, L=GPL, M=metano, 2=ibrida, E=elettrica)
- `gear` (M=manuale, A=automatico)
- `pricefrom/priceto`
- `powerfrom/powerto`
- `ustate` (N=nuovo, U=usato)

**Filtri ROTTI (non funzionano via URL):**
- `seller` (D/P) - MA il campo `data-seller-type` È disponibile nell'HTML
- `emissclass`, `damaged_listing`, `doors`, `color`, `seats`

**Data attributes disponibili nell'HTML:**
- `data-guid`, `data-price`, `data-mileage`, `data-first-registration`
- `data-fuel-type`, `data-seller-type`, `data-make`, `data-model`

### 2. MVP Hardening (Task A-E completati)

**Task A**: Test multi-modello su Fiat Panda, VW Golf, Tesla Model 3 ✓

**Task B**: Standardizzazione conteggio con deduplicazione GUID ✓

**Task C**: Schema DB Neon per caching aggregati ✓
- File: `migrations/001_query_stats.sql`
- Client: `src/lib/db.ts`

**Task D**: Statistiche robuste ✓
- File: `src/lib/robust-stats.ts`
- Deduplicazione per GUID
- Outlier removal con IQR (1.5x)
- Percentili P25/P50/P75
- Confidence: alta (n≥30, iqr<25%), media (n≥10, iqr<40%), bassa

**Task E**: UI aggiornata ✓
- File: `src/components/ValuationResult.tsx`
- Visualizzazione percentili con barra grafica
- Breakdown dealer/privati
- Badge confidence con tooltip IQR
- Timestamp "Aggiornato il..." con indicatore "(da cache)"

### 3. Architettura attuale

```
POST /api/valuate
    └── getOrComputeEstimate() [src/lib/estimate.ts]
        ├── getCachedStats() [src/lib/db.ts] → Neon Postgres
        │   └── Se cache hit → ritorna dati
        ├── fetchListingsMultiPage() [src/lib/datasource.ts] → AutoScout24
        ├── computeRobustStats() [src/lib/robust-stats.ts]
        └── upsertStats() [src/lib/db.ts] → Salva in cache
```

**Fallback strategies** (in ordine):
1. ±1 anno, ±15% km (stretta)
2. ±2 anni, ±15% km (anno allargato)
3. ±2 anni, ±30% km (anno+km allargati)
4. ±2 anni, ±30% km, senza filtro cambio

---

## Cosa resta da fare

### 1. Eseguire la migration SQL su Neon

```sql
-- Contenuto di migrations/001_query_stats.sql
CREATE TABLE IF NOT EXISTS query_stats (
  query_hash VARCHAR(64) PRIMARY KEY,
  filters_json JSONB NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'autoscout24',
  n_listings INTEGER NOT NULL,
  p25 INTEGER NOT NULL,
  p50 INTEGER NOT NULL,
  p75 INTEGER NOT NULL,
  min_clean INTEGER NOT NULL,
  max_clean INTEGER NOT NULL,
  iqr_ratio DECIMAL(5,4) NOT NULL,
  n_dealers INTEGER DEFAULT 0,
  n_private INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_query_stats_expires
ON query_stats(expires_at);
```

### 2. Verificare DATABASE_URL in .env.local

Dopo `npx neonctl init`, dovrebbe essere presente:
```
DATABASE_URL=postgresql://...
```

### 3. Test end-to-end

```bash
npm run dev
# Vai su http://localhost:3000
# Cerca "Fiat Panda 2020 50000km benzina manuale"
# Verifica che:
# - La valutazione funzioni
# - I dati vengano salvati in cache (check su Neon console)
# - La seconda richiesta usi la cache
```

### 4. Deploy su Vercel

```bash
vercel env add DATABASE_URL  # Aggiungi la connection string
vercel --prod
```

---

## File chiave

| File | Descrizione |
|------|-------------|
| `src/lib/estimate.ts` | Orchestrazione principale con fallback |
| `src/lib/robust-stats.ts` | Calcolo statistiche (dedup, IQR, percentili) |
| `src/lib/db.ts` | Client Neon Postgres |
| `src/lib/datasource.ts` | Scraping AutoScout24 |
| `src/components/ValuationResult.tsx` | UI risultati |
| `migrations/001_query_stats.sql` | Schema DB |

---

## Note tecniche

- **Rate limit AutoScout24**: 500ms tra richieste, max 2 req/sec
- **Cache TTL**: 24 ore (configurabile in `upsertStats`)
- **Build**: `npm run build` passa senza errori
- **Legacy code**: Spostato in `legacy/` ed escluso da tsconfig
