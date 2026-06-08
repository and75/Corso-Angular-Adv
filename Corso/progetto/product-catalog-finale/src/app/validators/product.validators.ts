// product.validators.ts — SOLUTION mini-lab G2
// Delta rispetto al seme: aggiunti detailedDescriptionIfAvailable (TODO 1)
// e uniqueProductNameValidator (TODO 2).

import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ProductService } from '../services/product';

/**
 * forbiddenWordsValidator (invariato dal seme).
 */
export function forbiddenWordsValidator(forbidden: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toLowerCase() as string;
    if (!value) return null;
    const found = forbidden.find(word => value.includes(word.toLowerCase()));
    if (!found) return null;
    return { forbiddenWord: { word: found } };
  };
}

/**
 * ✅ TODO 1 — Cross-field validator: "se Disponibile, descrizione dettagliata".
 *
 * Scatta a ogni cambio di un qualsiasi controllo del gruppo. Va agganciato
 * come secondo argomento di fb.group(controls, { validators: [...] }).
 */
export function detailedDescriptionIfAvailable(minLen: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const available   = group.get('available')?.value as boolean;
    const description = (group.get('description')?.value ?? '') as string;

    if (available && description.length < minLen) {
      return {
        detailedDescriptionRequired: {
          minLen,
          actualLen: description.length,
        },
      };
    }
    return null;
  };
}

/**
 * ✅ TODO 2 — Async validator: "nome prodotto univoco" via HTTP.
 *
 * Pattern canonico: debounce con timer(400) → switchMap (annulla la chiamata
 * precedente se il valore cambia) → map per costruire l'errore → catchError
 * per non bloccare l'utente se l'API è offline (fail-open).
 *
 * Va agganciato come TERZO argomento dell'array del controllo "name":
 *   name: [valore, sync[], async[]]
 */
export function uniqueProductNameValidator(
  productService: ProductService,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = (control.value ?? '').trim() as string;
    if (!name) return of(null);  // vuoto → required pensa al resto

    return timer(400).pipe(
      switchMap(() => productService.getProducts()),
      map(products =>
        products.some(p => p.name.toLowerCase() === name.toLowerCase())
          ? { nameTaken: { name } }
          : null,
      ),
      catchError(() => of(null)),  // network error → fail-open
    );
  };
}
