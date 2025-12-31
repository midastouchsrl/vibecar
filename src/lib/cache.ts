/**
 * Sistema di caching in-memory LRU
 * Semplice implementazione senza dipendenze esterne
 */

import { CACHE_CONFIG } from './config';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Semplice LRU Cache in-memory
 */
class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = CACHE_CONFIG.lruMaxSize, ttl: number = CACHE_CONFIG.lruTtl) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Ottieni un valore dalla cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Controlla TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // LRU: rimuovi e reinserisci per aggiornare l'ordine
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Inserisci un valore in cache
   */
  set(key: string, value: T): void {
    // Se già esiste, rimuovi prima (per aggiornare ordine)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Se pieno, rimuovi il più vecchio (primo inserito)
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Verifica se una chiave esiste e non è scaduta
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Rimuovi una chiave
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Pulisci tutta la cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Numero di elementi in cache
   */
  get size(): number {
    return this.cache.size;
  }
}

// Singleton per la cache delle valutazioni
export const valuationCache = new LRUCache<string>();

/**
 * Genera una chiave di cache normalizzata da un input
 */
export function generateCacheKey(input: Record<string, unknown>): string {
  // Ordina le chiavi e crea una stringa deterministica
  const sorted = Object.keys(input)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = input[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

  return JSON.stringify(sorted);
}

/**
 * Genera gli header HTTP per la cache
 */
export function getCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': `s-maxage=${CACHE_CONFIG.httpMaxAge}, stale-while-revalidate=${CACHE_CONFIG.httpStaleWhileRevalidate}`,
  };
}
