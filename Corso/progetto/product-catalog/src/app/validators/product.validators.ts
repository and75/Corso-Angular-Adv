// product.validators.ts — SOLUZIONE lab-14
// Validatore custom: forbiddenWordsValidator — factory function.

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Factory function: restituisce un ValidatorFn che controlla che
 * il valore del controllo non contenga nessuna delle parole vietate.
 *
 * Uso: forbiddenWordsValidator(['sconto', 'gratis', 'offerta'])
 *
 * Errore prodotto: { forbiddenWord: { word: 'sconto' } }
 */
export function forbiddenWordsValidator(forbidden: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toLowerCase() as string;

    // Se il campo è vuoto lasciamo che Validators.required gestisca l'errore
    if (!value) return null;

    const found = forbidden.find(word => value.includes(word.toLowerCase()));

    if (!found) return null;

    return { forbiddenWord: { word: found } };
  };
}
