/**
 * Data source per recuperare annunci auto
 *
 * Strategia MVP: utilizziamo AutoScout24 Italia che ha un endpoint
 * di ricerca pubblico. Facciamo scraping leggero con caching aggressivo
 * per minimizzare le richieste.
 *
 * NOTA: In produzione, considera l'uso di API ufficiali o partnership.
 * Questo approccio è solo per MVP/test.
 */

import { CarListing, CarValuationInput, FuelType, GearboxType } from './types';
import { valuationCache, generateCacheKey } from './cache';

// Mapping marche per URL AutoScout24
const BRAND_SLUGS: Record<string, string> = {
  'abarth': 'abarth',
  'alfa romeo': 'alfa-romeo',
  'audi': 'audi',
  'bmw': 'bmw',
  'chevrolet': 'chevrolet',
  'citroen': 'citroen',
  'dacia': 'dacia',
  'ds': 'ds-automobiles',
  'fiat': 'fiat',
  'ford': 'ford',
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
  'mini': 'mini',
  'mitsubishi': 'mitsubishi',
  'nissan': 'nissan',
  'opel': 'opel',
  'peugeot': 'peugeot',
  'porsche': 'porsche',
  'renault': 'renault',
  'seat': 'seat',
  'skoda': 'skoda',
  'smart': 'smart',
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
  'ibrida': 'B,2', // Benzina + Ibrido
  'elettrica': 'E',
};

// Mapping cambio
const GEARBOX_SLUGS: Record<GearboxType, string> = {
  'manuale': 'M',
  'automatico': 'A',
};

/**
 * Costruisce l'URL di ricerca AutoScout24
 */
function buildSearchUrl(
  input: CarValuationInput,
  yearMin: number,
  yearMax: number,
  kmMin: number,
  kmMax: number,
  page: number = 1
): string {
  const brand = BRAND_SLUGS[input.brand.toLowerCase()] || input.brand.toLowerCase();
  const model = input.model.toLowerCase().replace(/\s+/g, '-');

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
  });

  return `https://www.autoscout24.it/lst/${brand}/${model}?${params.toString()}`;
}

/**
 * Estrae i prezzi dalla pagina HTML di AutoScout24
 * Usa regex semplici per evitare dipendenze pesanti
 */
function extractListingsFromHtml(html: string): CarListing[] {
  const listings: CarListing[] = [];

  // Pattern per trovare i prezzi nei data attributes o nel markup
  // AutoScout24 usa vari formati, cerchiamo i più comuni

  // Pattern 1: data-price="12345"
  const pricePattern1 = /data-price="(\d+)"/g;
  let match;
  while ((match = pricePattern1.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price > 500 && price < 500000) {
      listings.push({ price, year: 0, km: 0 });
    }
  }

  // Se troviamo pochi risultati, proviamo altri pattern

  // Pattern 2: Prezzi nel formato €XX.XXX o € XX.XXX
  if (listings.length < 5) {
    const pricePattern2 = /[€]\s*([\d.]+)/g;
    while ((match = pricePattern2.exec(html)) !== null) {
      const priceStr = match[1].replace(/\./g, '');
      const price = parseInt(priceStr, 10);
      if (price > 500 && price < 500000) {
        // Evita duplicati
        if (!listings.some((l) => l.price === price)) {
          listings.push({ price, year: 0, km: 0 });
        }
      }
    }
  }

  // Pattern 3: Cerca nel JSON embedded (spesso c'è __NEXT_DATA__ o simili)
  const jsonPattern = /"price":\s*(\d+)/g;
  while ((match = jsonPattern.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price > 500 && price < 500000) {
      if (!listings.some((l) => l.price === price)) {
        listings.push({ price, year: 0, km: 0 });
      }
    }
  }

  // Pattern 4: rawPrice nei JSON
  const rawPricePattern = /"rawPrice":\s*(\d+)/g;
  while ((match = rawPricePattern.exec(html)) !== null) {
    const price = parseInt(match[1], 10);
    if (price > 500 && price < 500000) {
      if (!listings.some((l) => l.price === price)) {
        listings.push({ price, year: 0, km: 0 });
      }
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
  // Genera chiave cache
  const cacheKey = generateCacheKey({
    brand: input.brand.toLowerCase(),
    model: input.model.toLowerCase(),
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
    // Fetch con user-agent realistico e timeout
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

    // Salva in cache (anche se vuoto, per evitare richieste ripetute)
    valuationCache.set(cacheKey, JSON.stringify(listings));

    return listings;
  } catch (error) {
    console.error('[Fetch] Errore:', error);

    // In caso di errore, ritorna array vuoto
    // (la logica principale gestirà il fallback)
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
      if (!allListings.some(l => l.price === listing.price)) {
        allListings.push(listing);
      }
    }

    // Se questa pagina ha meno di 10 risultati, probabilmente non ci sono altre pagine
    if (pageListings.length < 10) {
      console.log(`[Fetch] Pagina ${page} con pochi risultati, stop paginazione`);
      break;
    }

    // Piccola pausa tra le richieste per evitare rate limiting
    if (page < maxPages) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log(`[Fetch] Totale annunci unici: ${allListings.length}`);
  return allListings;
}
