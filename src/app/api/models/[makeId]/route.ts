/**
 * API: Modelli per marca
 * GET /api/models/[makeId]
 *
 * Proxy verso AutoScout24 API con caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { getModelsApiUrl, findMakeById } from '@/lib/autoscout-data';

interface ModelFromApi {
  id: number;
  name: string;
  label?: Record<string, string>;
  makeId: number;
  modelLineId?: number | null;
}

interface ApiResponse {
  models?: {
    model?: {
      values?: ModelFromApi[];
    };
  };
}

// Cache in-memory per i modelli (evita richieste ripetute)
const modelsCache = new Map<number, { data: ModelFromApi[]; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ore

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ makeId: string }> }
) {
  const { makeId: makeIdStr } = await params;
  const makeId = parseInt(makeIdStr, 10);

  if (isNaN(makeId)) {
    return NextResponse.json({ error: 'ID marca non valido' }, { status: 400 });
  }

  // Verifica che la marca esista
  const make = findMakeById(makeId);
  if (!make) {
    return NextResponse.json({ error: 'Marca non trovata' }, { status: 404 });
  }

  // Controlla cache
  const cached = modelsCache.get(makeId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      makeId,
      makeName: make.name,
      models: cached.data.map((m) => ({
        id: m.id,
        name: m.name,
      })),
      cached: true,
    });
  }

  try {
    // Fetch da AutoScout24
    const url = getModelsApiUrl(makeId);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'it-IT,it;q=0.9',
      },
      next: { revalidate: 86400 }, // Cache Next.js: 24h
    });

    if (!response.ok) {
      throw new Error(`AutoScout24 API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    const models = data.models?.model?.values || [];

    // Salva in cache
    modelsCache.set(makeId, { data: models, timestamp: Date.now() });

    return NextResponse.json({
      makeId,
      makeName: make.name,
      models: models.map((m) => ({
        id: m.id,
        name: m.name,
      })),
      cached: false,
    });
  } catch (error) {
    console.error('[API/models] Error fetching models:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei modelli' },
      { status: 500 }
    );
  }
}
