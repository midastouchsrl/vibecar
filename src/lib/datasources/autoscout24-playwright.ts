/**
 * AutoScout24 Playwright Adapter
 * Scraping robusto con browser headless per bypassare blocchi e JS rendering
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { CarListing, CarValuationInput, FuelType, GearboxType } from '../types';
import { BODY_TYPE_SLUGS } from '../config';
import { DataSourceAdapter, SearchParams } from './types';

// Browser singleton per riuso
let browserInstance: Browser | null = null;
let browserContext: BrowserContext | null = null;

// Mapping alimentazione
const FUEL_SLUGS: Record<FuelType, string> = {
  'benzina': 'B',
  'diesel': 'D',
  'gpl': 'L',
  'metano': 'M',
  'ibrida': '2',
  'elettrica': 'E',
};

// Mapping cambio
const GEARBOX_SLUGS: Record<GearboxType, string> = {
  'manuale': 'M',
  'automatico': 'A',
};

// Brand slugs per URL
const BRAND_SLUGS: Record<string, string> = {
  'alfa romeo': 'alfa-romeo',
  'ds automobiles': 'ds-automobiles',
  'ds': 'ds-automobiles',
  'land rover': 'land-rover',
  'mercedes-benz': 'mercedes-benz',
};

/**
 * Ottiene o crea il browser singleton
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    console.log('[AS24-PW] Avvio browser Playwright...');
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
}

/**
 * Ottiene un context con configurazione anti-detection
 */
async function getContext(): Promise<BrowserContext> {
  if (!browserContext) {
    const browser = await getBrowser();
    browserContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'it-IT',
      timezoneId: 'Europe/Rome',
      extraHTTPHeaders: {
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
  }
  return browserContext;
}

/**
 * Chiude il browser (chiamare alla fine del processo)
 */
export async function closeBrowser(): Promise<void> {
  if (browserContext) {
    await browserContext.close();
    browserContext = null;
  }
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Costruisce l'URL di ricerca AutoScout24
 */
function buildSearchUrl(
  input: CarValuationInput,
  yearMin: number,
  yearMax: number,
  kmMin: number,
  kmMax: number,
  gearCode?: string
): string {
  const effectiveGearCode = gearCode || GEARBOX_SLUGS[input.gearbox] || 'M';

  const params = new URLSearchParams({
    'cy': 'I',
    'fregfrom': String(yearMin),
    'fregto': String(yearMax),
    'kmfrom': String(kmMin),
    'kmto': String(kmMax),
    'gear': effectiveGearCode,
    'sort': 'standard',
    'desc': '0',
    'atype': 'C',
    'ustate': 'N,U',
    'size': '20',
    'page': '1',
    'damaged_listing': 'exclude',
    'fuel': FUEL_SLUGS[input.fuel] || 'B',
  });

  // Aggiungi filtro carrozzeria se specificato
  if (input.bodyType && BODY_TYPE_SLUGS[input.bodyType]) {
    params.set('body', BODY_TYPE_SLUGS[input.bodyType]);
  }

  // Usa mmm per precisione se abbiamo gli ID
  if (input.makeId && input.modelId && !input.variant) {
    params.set('mmm', `${input.makeId}|${input.modelId}|`);
  }

  // Costruisci path URL
  const brand = BRAND_SLUGS[input.brand.toLowerCase()] || input.brand.toLowerCase().replace(/\s+/g, '-');
  const model = input.model.toLowerCase().replace(/\s+/g, '-');

  if (input.variant) {
    return `https://www.autoscout24.it/lst/${brand}/${model}/ve_${input.variant}?${params.toString()}`;
  }

  return `https://www.autoscout24.it/lst/${brand}/${model}?${params.toString()}`;
}

/**
 * Estrae i listing dalla pagina usando Playwright
 */
async function extractListingsFromPage(page: Page): Promise<CarListing[]> {
  const listings: CarListing[] = [];

  // Attendi che gli annunci siano caricati
  try {
    await page.waitForSelector('article[data-guid]', { timeout: 10000 });
  } catch {
    console.log('[AS24-PW] Nessun articolo trovato nella pagina');
    return [];
  }

  // Estrai dati da ogni articolo
  const articles = await page.$$('article[data-guid]');

  for (const article of articles) {
    try {
      const guid = await article.getAttribute('data-guid');
      const priceStr = await article.getAttribute('data-price');
      const mileageStr = await article.getAttribute('data-mileage');
      const firstReg = await article.getAttribute('data-first-registration');
      const fuelType = await article.getAttribute('data-fuel-type');
      const sellerType = await article.getAttribute('data-seller-type');

      if (!priceStr) continue;

      const price = parseInt(priceStr, 10);
      if (price < 500 || price > 500000) continue;

      const mileage = mileageStr ? parseInt(mileageStr, 10) : 0;

      let year = 0;
      if (firstReg) {
        const yearMatch = firstReg.match(/(\d{4})$/);
        year = yearMatch ? parseInt(yearMatch[1], 10) : 0;
      }

      listings.push({
        guid: guid || `as24-pw-${price}-${mileage}`,
        price,
        mileage,
        firstRegistration: firstReg || '',
        fuelType: fuelType || '',
        sellerType: (sellerType === 'p' ? 'p' : 'd') as 'd' | 'p',
        source: 'autoscout24-playwright',
        year,
        km: mileage,
      });
    } catch (err) {
      console.warn('[AS24-PW] Errore estrazione articolo:', err);
    }
  }

  return listings;
}

/**
 * Fetch listing da una singola pagina
 */
async function fetchPage(
  input: CarValuationInput,
  yearMin: number,
  yearMax: number,
  kmMin: number,
  kmMax: number,
  gearCode?: string
): Promise<CarListing[]> {
  const url = buildSearchUrl(input, yearMin, yearMax, kmMin, kmMax, gearCode);
  console.log(`[AS24-PW] Navigazione a: ${url}`);

  const context = await getContext();
  const page = await context.newPage();

  try {
    // Naviga con timeout generoso
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Attendi un po' per il rendering JS
    await page.waitForTimeout(2000);

    // Accetta cookie se presente
    try {
      const cookieButton = page.locator('button:has-text("Accetta"), button:has-text("Accept")');
      if (await cookieButton.isVisible({ timeout: 2000 })) {
        await cookieButton.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // Cookie banner non presente, continua
    }

    // Estrai listing
    const listings = await extractListingsFromPage(page);
    console.log(`[AS24-PW] Trovati ${listings.length} annunci`);

    return listings;
  } catch (err) {
    console.error('[AS24-PW] Errore navigazione:', err);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * AutoScout24 Playwright Adapter
 */
export class AutoScout24PlaywrightAdapter implements DataSourceAdapter {
  name = 'autoscout24-playwright';
  priority = 1;
  requiresBrowser = true;

  async fetchListings(
    input: CarValuationInput,
    params: SearchParams
  ): Promise<CarListing[]> {
    const { yearMin, yearMax, kmMin, kmMax } = params;
    const allListings: CarListing[] = [];
    const seenGuids = new Set<string>();

    // Cerca con cambio manuale e automatico separatamente per gearbox automatico
    const gearCodes = input.gearbox === 'automatico' ? ['A', 'S'] : ['M'];

    for (const gearCode of gearCodes) {
      try {
        const listings = await fetchPage(input, yearMin, yearMax, kmMin, kmMax, gearCode);

        for (const listing of listings) {
          if (!seenGuids.has(listing.guid)) {
            seenGuids.add(listing.guid);
            allListings.push(listing);
          }
        }

        // Delay tra richieste
        if (gearCodes.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.error(`[AS24-PW] Errore fetch gear=${gearCode}:`, err);
      }
    }

    console.log(`[AS24-PW] Totale annunci unici: ${allListings.length}`);
    return allListings;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const browser = await getBrowser();
      return browser.isConnected();
    } catch {
      return false;
    }
  }
}

// Export singleton
export const autoscout24PlaywrightAdapter = new AutoScout24PlaywrightAdapter();
