/**
 * API Endpoint: Varianti disponibili per modello
 * GET /api/variants/:makeId/:modelId
 *
 * Restituisce le varianti/versioni (modelLines) disponibili per un dato modello
 * basandosi sull'API taxonomy di AutoScout24
 */

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    makeId: string;
    modelId: string;
  }>;
}

interface ModelLineResponse {
  id: number;
  name: string;
  slug?: string;
}

// Cache in-memory per le varianti (24h)
const variantsCache = new Map<string, { data: ModelLineResponse[]; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ore

/**
 * Fetch varianti dall'API taxonomy di AutoScout24
 */
async function fetchVariantsFromTaxonomy(
  makeId: number,
  modelId: number,
  brandSlugHint?: string,
  modelSlugHint?: string
): Promise<ModelLineResponse[]> {
  const cacheKey = `variants-${makeId}-${modelId}`;
  const cached = variantsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Variants API] Cache hit per make=${makeId}, model=${modelId}`);
    return cached.data;
  }

  console.log(`[Variants API] Fetching variants per make=${makeId}, model=${modelId}`);

  try {
    // Prova prima l'API taxonomy
    const taxonomyUrl = `https://www.autoscout24.it/as24-home/api/taxonomy/cars/makes/${makeId}/models/${modelId}/modelLines`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(taxonomyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'it-IT,it;q=0.9',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      // L'API potrebbe restituire un array diretto o un oggetto con modelLines
      const modelLines: ModelLineResponse[] = Array.isArray(data)
        ? data.map((item: { id: number; name: string; slug?: string }) => ({
            id: item.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
          }))
        : (data.modelLines || []).map((item: { id: number; name: string; slug?: string }) => ({
            id: item.id,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
          }));

      // Cache il risultato
      variantsCache.set(cacheKey, {
        data: modelLines,
        timestamp: Date.now(),
      });

      console.log(`[Variants API] Trovate ${modelLines.length} varianti via taxonomy`);
      return modelLines;
    }

    console.log(`[Variants API] Taxonomy API returned ${response.status}, trying scraping fallback`);
  } catch (error) {
    console.error('[Variants API] Taxonomy API error:', error);
  }

  // Fallback: scraping della pagina filtri
  return await fetchVariantsFromScraping(makeId, modelId, brandSlugHint, modelSlugHint);
}

/**
 * Fallback: estrae varianti dalla pagina di ricerca AutoScout24
 * Cerca nella sezione "Versione" del footer della pagina risultati
 *
 * Se brandSlugHint e modelSlugHint sono forniti, li usa direttamente.
 * Altrimenti: Step 1: Fetch con mmm parameter per ottenere brand/model slug dalla redirect/breadcrumb
 * Step 2: Fetch con brand/model path per ottenere la sezione "Versione"
 */
async function fetchVariantsFromScraping(
  makeId: number,
  modelId: number,
  brandSlugHint?: string,
  modelSlugHint?: string
): Promise<ModelLineResponse[]> {
  console.log(`[Variants API] Starting scraping for make=${makeId}, model=${modelId} (v3) with hints: ${brandSlugHint}/${modelSlugHint}`);
  try {
    let brandSlug: string | null = brandSlugHint || null;
    let modelSlug: string | null = modelSlugHint || null;

    // Se abbiamo già i slug hints, saltiamo la discovery
    if (!brandSlug || !modelSlug) {
      // Step 1: Fetch iniziale per scoprire brand/model slug
      const initialUrl = `https://www.autoscout24.it/lst?mmm=${makeId}|${modelId}|&cy=I`;

      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 10000);

      const response1 = await fetch(initialUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'it-IT,it;q=0.9',
        },
        signal: controller1.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId1);

      if (!response1.ok) {
        console.log(`[Variants API] Initial fetch returned ${response1.status}`);
        return [];
      }

      // Estrai brand/model dal URL finale (dopo redirect) o dall'HTML
      const finalUrl = response1.url;
      const brandModelMatch = finalUrl.match(/\/lst\/([^/?]+)\/([^/?]+)/);

      if (brandModelMatch) {
        // URL ha già brand/model (es. redirect a /lst/fiat/panda)
        brandSlug = brandModelMatch[1];
        modelSlug = brandModelMatch[2];
      } else {
        // URL è ancora con mmm parameter, estrai da HTML
        const html1 = await response1.text();

        // Cerca brand nel breadcrumb: "@id":"/lst/volkswagen","name":"Volkswagen"
        const brandMatch = html1.match(/"@id":"\/lst\/([a-z0-9-]+)","name":"[^"]+"/);
        if (brandMatch) {
          brandSlug = brandMatch[1];

          // Cerca model slug nei link della pagina: /lst/brand/model
          // Prende il primo link che ha brand + model
          const modelLinkMatch = html1.match(new RegExp(`/lst/${brandSlug}/([a-z0-9-]+)(?:\\?|")`));
          if (modelLinkMatch) {
            modelSlug = modelLinkMatch[1];
          } else {
            // Fallback: cerca in title o h1 per estrarre nome modello
            const titleMatch = html1.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) {
              // Titolo tipo "Volkswagen Golf usata..." -> estrai "golf"
              const titleParts = titleMatch[1].toLowerCase().split(/\s+/);
              // Cerca la parola dopo il brand
              const brandIdx = titleParts.findIndex(p => p === brandSlug || p.includes(brandSlug!));
              if (brandIdx >= 0 && titleParts[brandIdx + 1]) {
                modelSlug = titleParts[brandIdx + 1].replace(/[^a-z0-9-]/g, '');
              }
            }
          }
        }
      }

      if (!brandSlug || !modelSlug) {
        console.log(`[Variants API] Could not determine brand/model slug from URL: ${finalUrl}`);
        return [];
      }

      console.log(`[Variants API] Resolved slugs from discovery: ${brandSlug}/${modelSlug}`);
    } else {
      console.log(`[Variants API] Using provided slugs: ${brandSlug}/${modelSlug}`);
    }

    // Step 2: Fetch pagina con path brand/model per ottenere versioni
    const searchUrl = `https://www.autoscout24.it/lst/${brandSlug}/${modelSlug}?cy=I`;

    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 15000);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'it-IT,it;q=0.9',
      },
      signal: controller2.signal,
    });

    clearTimeout(timeoutId2);

    if (!response.ok) {
      console.log(`[Variants API] Scraping fallback returned ${response.status}`);
      return [];
    }

    const html = await response.text();
    const variants: ModelLineResponse[] = [];

    // Pattern 1: Link nella sezione "Versione" del footer
    // Gestisce sia URL assoluti (https://...) che relativi (/lst/...)
    // Formato: href="[...]/lst/brand/model/ve_slug">Nome Completo</a>
    // IMPORTANTE: [a-z0-9.-]+ include il punto per "1.2", "2.0" ecc.
    const versionLinkPattern = /href="(?:https?:\/\/[^"]+)?\/lst\/[^"]+\/ve_([a-z0-9.-]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;

    while ((match = versionLinkPattern.exec(html)) !== null) {
      const slug = match[1];
      let name = match[2].trim();

      // Rimuovi prefisso brand/model ridondante (es. "Fiat Panda 4x4" -> "4x4")
      // Cerca pattern tipo "Brand Model Versione"
      const cleanNameMatch = name.match(/^[A-Z][a-z]+\s+[A-Z]?[a-z]+\s+(.+)$/);
      if (cleanNameMatch) {
        name = cleanNameMatch[1];
      }

      if (name && slug && !variants.find(v => v.slug === slug)) {
        variants.push({
          id: 0,
          name,
          slug,
        });
      }
    }

    // Pattern 2: Fallback - cerca pattern ve_ nell'URL con nome generato da slug
    // Gestisce sia URL assoluti che relativi
    if (variants.length === 0) {
      const linkPattern = /(?:https?:\/\/[^/]+)?\/lst\/[^/]+\/[^/]+\/ve_([a-z0-9.-]+)/gi;
      while ((match = linkPattern.exec(html)) !== null) {
        const slug = match[1];
        if (!variants.find(v => v.slug === slug)) {
          // Converti slug in nome leggibile (es. "4x4-cross" -> "4x4 Cross")
          const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          variants.push({
            id: 0,
            name,
            slug,
          });
        }
      }
    }

    const cacheKey = `variants-${makeId}-${modelId}`;
    variantsCache.set(cacheKey, {
      data: variants,
      timestamp: Date.now(),
    });

    console.log(`[Variants API] Trovate ${variants.length} varianti via scraping`);
    return variants;
  } catch (error) {
    console.error('[Variants API] Scraping fallback error:', error);
    return [];
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { makeId, modelId } = await params;

  // Leggi query params per brand/model slugs (forniti dal frontend)
  const { searchParams } = new URL(request.url);
  const brandSlugHint = searchParams.get('brand') || undefined;
  const modelSlugHint = searchParams.get('model') || undefined;

  // Valida parametri
  const makeIdNum = parseInt(makeId, 10);
  const modelIdNum = parseInt(modelId, 10);

  if (isNaN(makeIdNum) || isNaN(modelIdNum)) {
    return NextResponse.json(
      { error: 'makeId e modelId devono essere numeri validi' },
      { status: 400 }
    );
  }

  try {
    const variants = await fetchVariantsFromTaxonomy(makeIdNum, modelIdNum, brandSlugHint, modelSlugHint);

    return NextResponse.json({
      makeId: makeIdNum,
      modelId: modelIdNum,
      variants: variants.map(v => ({
        id: v.id || v.slug,
        name: v.name,
        slug: v.slug,
      })),
      count: variants.length,
    });
  } catch (error) {
    console.error('[Variants API] Errore:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle varianti' },
      { status: 500 }
    );
  }
}
