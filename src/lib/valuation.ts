/**
 * Servizio di valutazione - funzioni di utilità
 * La logica principale è ora in estimate.ts
 */

import { CarValuationInput, ValuationError, ValuationResponse } from './types';

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

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica se una risposta è un errore
 */
export function isValuationError(
  response: ValuationResponse
): response is ValuationError {
  return 'error' in response && response.error === true;
}
