/**
 * Modulo statistiche robuste per VibeCar
 * - Deduplicazione per GUID
 * - Outlier removal con IQR
 * - Calcolo percentili P25/P50/P75
 * - Affidabilita basata su n e variabilita
 */

import { CarListing, ConfidenceLevel } from './types';

/**
 * Risultato calcolo statistiche
 */
export interface RobustStats {
  // Conteggi
  nRaw: number;           // Prima di dedup
  nDedup: number;         // Dopo dedup
  nClean: number;         // Dopo outlier removal
  nDealers: number;
  nPrivate: number;

  // Percentili (dopo outlier removal)
  p25: number;
  p50: number;  // mediana
  p75: number;
  minClean: number;
  maxClean: number;

  // Variabilita
  iqr: number;      // P75 - P25
  iqrRatio: number; // IQR / P50

  // Affidabilita
  confidence: ConfidenceLevel;
}

/**
 * Calcola percentile su array ordinato
 */
function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  if (sortedArr.length === 1) return sortedArr[0];

  const index = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedArr.length) return sortedArr[sortedArr.length - 1];
  if (lower === upper) return sortedArr[lower];

  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

/**
 * Deduplica listing per GUID
 */
export function deduplicateListings(listings: CarListing[]): CarListing[] {
  const seen = new Set<string>();
  const unique: CarListing[] = [];

  for (const listing of listings) {
    // Usa GUID se disponibile, altrimenti genera key da prezzo+km
    const key = listing.guid || `${listing.price}-${listing.mileage || listing.km}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(listing);
    }
  }

  return unique;
}

/**
 * Rimuove outlier usando metodo IQR
 * Esclude valori sotto Q1 - 1.5*IQR e sopra Q3 + 1.5*IQR
 */
export function removeOutliersIQR(prices: number[]): number[] {
  if (prices.length < 4) return prices;

  const sorted = [...prices].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;

  // Usiamo 1.5*IQR come threshold standard
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return sorted.filter(p => p >= lowerBound && p <= upperBound);
}

/**
 * Calcola affidabilita basata su n e variabilita
 */
export function calculateConfidence(
  n: number,
  iqrRatio: number
): ConfidenceLevel {
  // Alta: almeno 30 annunci e variabilita < 25%
  if (n >= 30 && iqrRatio < 0.25) {
    return 'alta';
  }

  // Media: almeno 10 annunci e variabilita < 40%
  if (n >= 10 && iqrRatio < 0.40) {
    return 'media';
  }

  // Bassa: tutto il resto
  return 'bassa';
}

/**
 * Calcola statistiche robuste da lista di listing
 */
export function computeRobustStats(listings: CarListing[]): RobustStats | null {
  const nRaw = listings.length;

  if (nRaw === 0) {
    return null;
  }

  // Step 1: Deduplicazione
  const dedupListings = deduplicateListings(listings);
  const nDedup = dedupListings.length;

  if (nDedup === 0) {
    return null;
  }

  // Step 2: Conta dealer/privati
  let nDealers = 0;
  let nPrivate = 0;
  for (const l of dedupListings) {
    if (l.sellerType === 'd') nDealers++;
    else if (l.sellerType === 'p') nPrivate++;
    else nDealers++; // Default dealer se non specificato
  }

  // Step 3: Estrai prezzi
  const prices = dedupListings
    .map(l => l.price)
    .filter(p => p > 500 && p < 500000); // Sanity check

  if (prices.length === 0) {
    return null;
  }

  // Step 4: Rimuovi outlier
  const cleanPrices = removeOutliersIQR(prices);
  const nClean = cleanPrices.length;

  if (nClean === 0) {
    return null;
  }

  // Step 5: Calcola percentili
  const sorted = [...cleanPrices].sort((a, b) => a - b);
  const p25 = Math.round(percentile(sorted, 25));
  const p50 = Math.round(percentile(sorted, 50));
  const p75 = Math.round(percentile(sorted, 75));
  const minClean = sorted[0];
  const maxClean = sorted[sorted.length - 1];

  // Step 6: Calcola variabilita
  const iqr = p75 - p25;
  const iqrRatio = p50 > 0 ? iqr / p50 : 0;

  // Step 7: Calcola affidabilita
  const confidence = calculateConfidence(nClean, iqrRatio);

  return {
    nRaw,
    nDedup,
    nClean,
    nDealers,
    nPrivate,
    p25,
    p50,
    p75,
    minClean,
    maxClean,
    iqr,
    iqrRatio,
    confidence,
  };
}

/**
 * Genera hash della query per cache key
 */
export function generateQueryHash(params: Record<string, unknown>): string {
  // Ordina le chiavi per consistenza
  const sortedKeys = Object.keys(params).sort();
  const normalized = sortedKeys
    .map(k => `${k}:${String(params[k]).toLowerCase()}`)
    .join('|');

  // Simple hash (non cryptographic, solo per cache key)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Formatta prezzo in EUR
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formatta numero con separatore migliaia
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('it-IT').format(n);
}

/**
 * Arrotonda a multiplo (es. 50 EUR)
 */
export function roundToMultiple(value: number, multiple: number): number {
  return Math.round(value / multiple) * multiple;
}
