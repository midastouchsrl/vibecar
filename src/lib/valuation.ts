/**
 * Servizio di valutazione principale
 * Orchestrazione del flusso: input -> fetch -> calcolo -> output
 */

import { CarValuationInput, ValuationResult, ValuationError, ValuationResponse } from './types';
import { DEFAULT_VALUATION_CONFIG } from './config';
import { fetchListingsMultiPage } from './datasource';
import { computeValuation } from './stats';
import { valuationCache, generateCacheKey } from './cache';

/**
 * Valida l'input del form
 */
export function validateInput(input: Partial<CarValuationInput>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.brand || input.brand.trim().length < 2) {
    errors.push('Marca non valida');
  }

  if (!input.model || input.model.trim().length < 1) {
    errors.push('Modello non valido');
  }

  const currentYear = new Date().getFullYear();
  if (!input.year || input.year < 1990 || input.year > currentYear + 1) {
    errors.push(`Anno deve essere tra 1990 e ${currentYear}`);
  }

  if (!input.km || input.km < 0 || input.km > 999999) {
    errors.push('Chilometraggio non valido');
  }

  if (!input.fuel) {
    errors.push('Seleziona il tipo di alimentazione');
  }

  if (!input.gearbox) {
    errors.push('Seleziona il tipo di cambio');
  }

  if (!input.region) {
    errors.push('Seleziona la regione');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Esegue la valutazione completa
 */
export async function performValuation(
  input: CarValuationInput
): Promise<ValuationResponse> {
  const config = DEFAULT_VALUATION_CONFIG;

  // Calcola finestre di ricerca
  const yearMin = input.year - config.yearWindow;
  const yearMax = input.year + config.yearWindow;
  const kmDelta = Math.round(input.km * config.kmWindowPercent);
  const kmMin = Math.max(0, input.km - kmDelta);
  const kmMax = input.km + kmDelta;

  // Controlla cache per risultato completo
  const resultCacheKey = `result:${generateCacheKey(input as unknown as Record<string, unknown>)}`;
  const cachedResult = valuationCache.get(resultCacheKey);
  if (cachedResult) {
    console.log('[Valuation] Risultato da cache');
    return JSON.parse(cachedResult) as ValuationResult;
  }

  try {
    // Fetch annunci
    const listings = await fetchListingsMultiPage(
      input,
      yearMin,
      yearMax,
      kmMin,
      kmMax
    );

    if (listings.length === 0) {
      // Nessun annuncio trovato
      return {
        error: true,
        message: 'Nessun annuncio trovato per questa ricerca.',
        suggestion:
          'Prova ad allargare i criteri: modello più generico o regione diversa.',
      };
    }

    // Calcola valutazione
    const result = computeValuation(
      listings,
      {
        region: input.region,
        year: input.year,
        km: input.km,
        condition: input.condition,
      },
      config
    );

    if (!result) {
      return {
        error: true,
        message: 'Impossibile calcolare la valutazione.',
        suggestion: 'I dati trovati non sono sufficienti per una stima affidabile.',
      };
    }

    // Salva in cache
    valuationCache.set(resultCacheKey, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error('[Valuation] Errore:', error);

    return {
      error: true,
      message: 'Si è verificato un errore durante la valutazione.',
      suggestion:
        'Il servizio potrebbe essere temporaneamente non disponibile. Riprova tra qualche minuto.',
    };
  }
}

/**
 * Verifica se una risposta è un errore
 */
export function isValuationError(
  response: ValuationResponse
): response is ValuationError {
  return 'error' in response && response.error === true;
}
