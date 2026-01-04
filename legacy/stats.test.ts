/**
 * Test unitari per le funzioni statistiche
 * Verificano la correttezza del calcolo valutazione
 */

import {
  percentile,
  median,
  removeOutliers,
  calculatePriceStats,
  applyConditionAdjustment,
  calculateDealerPrice,
  determineConfidence,
  extractValidPrices,
  computeValuation,
} from '../src/lib/stats';
import { CarListing, ValuationConfig } from '../src/lib/types';
import { DEFAULT_VALUATION_CONFIG } from '../src/lib/config';

// Import fixtures
import sampleListings from '../fixtures/sample-listings.json';

describe('percentile', () => {
  test('calcola correttamente il percentile 50 (mediana)', () => {
    const sorted = [1, 2, 3, 4, 5];
    expect(percentile(sorted, 50)).toBe(3);
  });

  test('calcola correttamente il percentile 25', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(percentile(sorted, 25)).toBeCloseTo(2.75, 1);
  });

  test('calcola correttamente il percentile 75', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(percentile(sorted, 75)).toBeCloseTo(6.25, 1);
  });

  test('gestisce array vuoto', () => {
    expect(percentile([], 50)).toBe(0);
  });

  test('gestisce array con un solo elemento', () => {
    expect(percentile([42], 50)).toBe(42);
    expect(percentile([42], 25)).toBe(42);
  });
});

describe('median', () => {
  test('calcola correttamente la mediana di numeri dispari', () => {
    expect(median([3, 1, 5, 2, 4])).toBe(3);
  });

  test('calcola correttamente la mediana di numeri pari', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  test('gestisce array vuoto', () => {
    expect(median([])).toBe(0);
  });
});

describe('removeOutliers', () => {
  test('rimuove outlier sotto P10 e sopra P90', () => {
    const prices = [
      100, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
      1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 10000,
    ];
    const cleaned = removeOutliers(prices, 10, 90);

    // Gli outlier estremi (100 e 10000) dovrebbero essere rimossi
    expect(cleaned).not.toContain(100);
    expect(cleaned).not.toContain(10000);
  });

  test('non rimuove outlier con meno di 5 elementi', () => {
    const prices = [100, 500, 1000, 5000];
    const cleaned = removeOutliers(prices, 10, 90);

    expect(cleaned).toEqual(prices);
  });
});

describe('calculatePriceStats', () => {
  test('calcola correttamente tutte le statistiche', () => {
    const prices = sampleListings.listings.map((l) => l.price);
    const stats = calculatePriceStats(prices);

    expect(stats.prices.length).toBe(prices.length);
    expect(stats.median).toBeGreaterThan(0);
    expect(stats.p25).toBeLessThan(stats.median);
    expect(stats.p75).toBeGreaterThan(stats.median);
    expect(stats.iqr).toBe(stats.p75 - stats.p25);
  });

  test('gestisce array vuoto', () => {
    const stats = calculatePriceStats([]);

    expect(stats.median).toBe(0);
    expect(stats.p25).toBe(0);
    expect(stats.p75).toBe(0);
  });
});

describe('applyConditionAdjustment', () => {
  test('riduce del 7% per condizione scarsa', () => {
    const price = 10000;
    const adjusted = applyConditionAdjustment(price, 'scarsa');
    expect(adjusted).toBe(9300);
  });

  test('aumenta del 5% per condizione ottima', () => {
    const price = 10000;
    const adjusted = applyConditionAdjustment(price, 'ottima');
    expect(adjusted).toBe(10500);
  });

  test('non modifica per condizione normale', () => {
    const price = 10000;
    const adjusted = applyConditionAdjustment(price, 'normale');
    expect(adjusted).toBe(10000);
  });

  test('gestisce undefined come normale', () => {
    const price = 10000;
    const adjusted = applyConditionAdjustment(price, undefined);
    expect(adjusted).toBe(10000);
  });
});

describe('calculateDealerPrice', () => {
  test('applica sconto del 14% e arrotonda ai 50€', () => {
    const median = 10000;
    const dealerPrice = calculateDealerPrice(median);

    // 10000 * 0.86 = 8600
    expect(dealerPrice).toBe(8600);
  });

  test('arrotonda correttamente ai 50€ più vicini', () => {
    const median = 10123;
    const dealerPrice = calculateDealerPrice(median);

    // 10123 * 0.86 = 8705.78 → arrotondato a 8700
    expect(dealerPrice % 50).toBe(0);
  });
});

describe('determineConfidence', () => {
  test('ritorna alta con molti samples e bassa dispersione', () => {
    const confidence = determineConfidence(50, 0.15);
    expect(confidence).toBe('alta');
  });

  test('ritorna media con samples sufficienti', () => {
    const confidence = determineConfidence(25, 0.30);
    expect(confidence).toBe('media');
  });

  test('ritorna bassa con pochi samples', () => {
    const confidence = determineConfidence(10, 0.10);
    expect(confidence).toBe('bassa');
  });

  test('ritorna media se samples alti ma dispersione alta', () => {
    const confidence = determineConfidence(50, 0.35);
    expect(confidence).toBe('media');
  });
});

describe('extractValidPrices', () => {
  test('estrae solo prezzi validi', () => {
    const listings: CarListing[] = [
      { price: 10000, year: 2020, km: 50000 },
      { price: 0, year: 2020, km: 50000 },
      { price: -500, year: 2020, km: 50000 },
      { price: NaN, year: 2020, km: 50000 },
      { price: 15000, year: 2020, km: 50000 },
    ];

    const prices = extractValidPrices(listings);

    expect(prices).toEqual([10000, 15000]);
  });
});

describe('computeValuation', () => {
  test('calcola valutazione completa da listings', () => {
    const listings = sampleListings.listings as CarListing[];

    const result = computeValuation(listings, {
      region: 'Lombardia',
      year: 2020,
      km: 50000,
      condition: 'normale',
    });

    expect(result).not.toBeNull();
    if (result) {
      expect(result.samples).toBeGreaterThan(0);
      expect(result.range_min).toBeLessThan(result.range_max);
      expect(result.market_median).toBeGreaterThan(result.range_min);
      expect(result.market_median).toBeLessThan(result.range_max);
      expect(result.dealer_buy_price).toBeLessThan(result.market_median);
      expect(['alta', 'media', 'bassa']).toContain(result.confidence);
      expect(result.explanation.length).toBeGreaterThan(0);
    }
  });

  test('applica correttamente aggiustamento condizione', () => {
    const listings = sampleListings.listings as CarListing[];

    const resultNormale = computeValuation(listings, {
      region: 'Lombardia',
      year: 2020,
      km: 50000,
      condition: 'normale',
    });

    const resultScarsa = computeValuation(listings, {
      region: 'Lombardia',
      year: 2020,
      km: 50000,
      condition: 'scarsa',
    });

    expect(resultNormale).not.toBeNull();
    expect(resultScarsa).not.toBeNull();

    if (resultNormale && resultScarsa) {
      // Con condizione scarsa, i prezzi dovrebbero essere inferiori
      expect(resultScarsa.market_median).toBeLessThan(resultNormale.market_median);
    }
  });

  test('ritorna null con array vuoto', () => {
    const result = computeValuation([], {
      region: 'Lombardia',
      year: 2020,
      km: 50000,
    });

    expect(result).toBeNull();
  });
});
