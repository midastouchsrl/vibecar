/**
 * Data source per recuperare annunci auto
 *
 * Utilizziamo AutoScout24 Italia con gli ID precisi per marca/modello
 * per ricerche accurate (inclusi allestimenti AMG, RS, ecc.)
 */

import { CarListing, CarValuationInput, FuelType, GearboxType } from './types';
import { valuationCache, generateCacheKey } from './cache';
import { FUEL_MAP, GEARBOX_MAP } from './autoscout-data';

// Mapping marche per URL fallback (quando non abbiamo makeId)
const BRAND_SLUGS: Record<string, string> = {
  'abarth': 'abarth',
  'alfa romeo': 'alfa-romeo',
  'audi': 'audi',
  'bmw': 'bmw',
  'byd': 'byd',
  'chevrolet': 'chevrolet',
  'citroen': 'citroen',
  'cupra': 'cupra',
  'dacia': 'dacia',
  'ds': 'ds-automobiles',
  'ds automobiles': 'ds-automobiles',
  'fiat': 'fiat',
  'ford': 'ford',
  'genesis': 'genesis',
  'honda': 'honda',
  'hyundai': 'hyundai',
  'jaguar': 'jaguar',
  'jeep': 'jeep',
  'kia': 'kia',
  'lancia': 'lancia',
  'land rover': 'land-rover',
  'lexus': 'lexus',
  'mazda': 'mazda',
  'mercedes-benz': 'mercedes-benz',
  'mg': 'mg',
  'mini': 'mini',
  'mitsubishi': 'mitsubishi',
  'nissan': 'nissan',
  'opel': 'opel',
  'peugeot': 'peugeot',
  'polestar': 'polestar',
  'porsche': 'porsche',
  'renault': 'renault',
  'seat': 'seat',
  'skoda': 'skoda',
  'smart': 'smart',
  'ssangyong': 'ssangyong',
  'subaru': 'subaru',
  'suzuki': 'suzuki',
  'tesla': 'tesla',
  'toyota': 'toyota',
  'volkswagen': 'volkswagen',
  'volvo': 'volvo',
};

// Mapping alimentazione
const FUEL_SLUGS: Record<FuelType, string> = {
  'benzina': 'B',
  'diesel': 'D',
  'gpl': 'L',
  'metano': 'M',
  'ibrida': '2', // Ibrido benzina
  'elettrica': 'E',
};

// Mapping cambio
const GEARBOX_SLUGS: Record<GearboxType, string> = {
  'manuale': 'M',
  'automatico': 'A',
};

/**
 * Costruisce l'URL di ricerca AutoScout24
 * Usa gli ID quando disponibili per ricerche precise
 */
function buildSearchUrl(
  input: CarValuationInput,
  yearMin: number,
  yearMax: number,
  kmMin: number,
  kmMax: number,
  page: number = 1
): string {
  const params = new URLSearchParams({
    'cy': 'I', // Italia
    'fregfrom': String(yearMin),
    'fregto': String(yearMax),
    'kmfrom': String(kmMin),
    'kmto': String(kmMax),
    'fuel': FUEL_SLUGS[input.fuel] || 'B',
    'gear': GEARBOX_SLUGS[input.gearbox] || 'M',
    'sort': 'standard',
    'desc': '0',
    'atype': 'C', // Solo auto
    'ustate': 'N,U', // Nuove e usate
    'size': '20', // Max risultati per pagina
    'page': String(page),
    'damaged_listing': 'exclude',
  });

  // Se abbiamo makeId e modelId, usa il formato mmm (più preciso)
  if (input.makeId && input.modelId) {
    params.set('mmm', `${input.makeId}|${input.modelId}|`);
    return `https://www.autoscout24.it/lst?${params.toString()}`;
  }

  // Fallback: usa slug marca/modello
  const brand = BRAND_SLUGS[input.brand.toLowerCase()] || input.brand.toLowerCase().replace(/\s+/g, '-');
  const model = input.model.toLowerCase().replace(/\s+/g, '-');

  return `https://www.autoscout24.it/lst/${brand}/${model}?${params.toString()}`;
}

/**
 * Estrae i prezzi dalla pagina HTML di AutoScout24
 */
function extractListingsFromHtml(html: string): CarListing[] {
  const listings: CarListing[] = [];
  const seenPrices = new Set<number>();

  // Pattern 1: data-price="12345"
  const pricePattern1 = /data-price="(\d+)"/g;
  let match;
  while ((match = pricePattern1.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price > 500 && price < 500000 && !seenPrices.has(price)) {
      seenPrices.add(price);
      listings.push({ price, year: 0, km: 0 });
    }
  }

  // Pattern 2: Prezzi nel formato €XX.XXX
  const pricePattern2 = /[€]\s*([\d.]+)/g;
  while ((match = pricePattern2.exec(html)) !== null) {
    const priceStr = match[1].replace(/\./g, '');
    const price = parseInt(priceStr, 10);
    if (price > 500 && price < 500000 && !seenPrices.has(price)) {
      seenPrices.add(price);
      listings.push({ price, year: 0, km: 0 });
    }
  }

  // Pattern 3: "price": 12345 nel JSON
  const jsonPattern = /"price":\s*(\d+)/g;
  while ((match = jsonPattern.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price > 500 && price < 500000 && !seenPrices.has(price)) {
      seenPrices.add(price);
      listings.push({ price, year: 0, km: 0 });
    }
  }

  // Pattern 4: "rawPrice": 12345
  const rawPricePattern = /"rawPrice":\s*(\d+)/g;
  while ((match = rawPricePattern.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price > 500 && price < 500000 && !seenPrices.has(price)) {
      seenPrices.add(price);
      listings.push({ price, year: 0, km: 0 });
    }
  }

  return listings;
}

/**
 * Fetch dei listing da AutoScout24 con caching (singola pagina)
 */
export async function fetchListings(
  input: CarValuationInput,
  yearMin: number,
  yearMax: number,
  kmMin: number,
  kmMax: number,
  page: number = 1
): Promise<CarListing[]> {
  // Genera chiave cache (include makeId/modelId se presenti)
  const cacheKey = generateCacheKey({
    brand: input.brand.toLowerCase(),
    model: input.model.toLowerCase(),
    makeId: input.makeId,
    modelId: input.modelId,
    yearMin,
    yearMax,
    kmMin,
    kmMax,
    fuel: input.fuel,
    gearbox: input.gearbox,
    page,
  });

  // Controlla cache
  const cached = valuationCache.get(cacheKey);
  if (cached) {
    console.log('[Cache] Hit per pagina', page);
    return JSON.parse(cached) as CarListing[];
  }

  console.log(`[Fetch] Richiesta a AutoScout24 pagina ${page}...`);

  const url = buildSearchUrl(input, yearMin, yearMax, kmMin, kmMax, page);
  console.log('[Fetch] URL:', url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[Fetch] Errore HTTP:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const listings = extractListingsFromHtml(html);

    console.log(`[Fetch] Pagina ${page}: trovati ${listings.length} annunci`);

    // Salva in cache
    valuationCache.set(cacheKey, JSON.stringify(listings));

    return listings;
  } catch (error) {
    console.error('[Fetch] Errore:', error);
    return [];
  }
}

/**
 * Fetch multipagina per ottenere più risultati
 */
export async function fetchListingsMultiPage(
  input: CarValuationInput,
  yearMin: number,
  yearMax: number,
  kmMin: number,
  kmMax: number,
  maxPages: number = 5
): Promise<CarListing[]> {
  const allListings: CarListing[] = [];
  const seenPrices = new Set<number>();

  for (let page = 1; page <= maxPages; page++) {
    const pageListings = await fetchListings(
      input,
      yearMin,
      yearMax,
      kmMin,
      kmMax,
      page
    );

    // Aggiungi i risultati evitando duplicati
    for (const listing of pageListings) {
      if (!seenPrices.has(listing.price)) {
        seenPrices.add(listing.price);
        allListings.push(listing);
      }
    }

    // Se questa pagina ha meno di 10 risultati, stop
    if (pageListings.length < 10) {
      console.log(`[Fetch] Pagina ${page} con pochi risultati, stop paginazione`);
      break;
    }

    // Pausa tra le richieste
    if (page < maxPages) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`[Fetch] Totale annunci unici: ${allListings.length}`);
  return allListings;
}
