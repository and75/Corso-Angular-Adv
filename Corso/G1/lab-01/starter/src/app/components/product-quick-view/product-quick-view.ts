/**
 * LAB 1 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/product-quick-view/product-quick-view.ts
 *
 * Nuovo componente che verrà istanziato DINAMICAMENTE dalla HomePage
 * con ViewContainerRef.createComponent (Scheda 08).
 *
 * Requisito formale: deve essere standalone, altrimenti createComponent
 * fallisce con un errore esplicito.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component } from '@angular/core';
// TODO 4: aggiungi qui sopra:
//   - le funzioni signal moderne per dichiarare input richiesti e output
//   - la funzione computed per derivare il prezzo formattato
// TODO 4: aggiungi qui sotto l'import del tipo Product dal product.model.

@Component({
  selector: 'app-product-quick-view',
  standalone: true,
  templateUrl: './product-quick-view.html',
})
export class ProductQuickView {

  /**
   * TODO 4 — [MEDIO] Dichiarare:
   *
   *   - product : signal INPUT richiesto di tipo Product. Useremo la forma
   *     "input.required<T>()" coerente col resto del seme (vedi product-card.ts).
   *
   *   - close : signal OUTPUT senza payload (tipo void). È l'evento che la
   *     preview emette quando l'utente clicca il pulsante "✕" del template;
   *     la HomePage lo ascolterà per distruggere il componente con vcr.clear().
   *
   *   - formattedPrice : computed che restituisce il prezzo formattato in
   *     euro italiani. Stesso pattern di ProductCard:
   *     Intl.NumberFormat('it-IT', { style:'currency', currency:'EUR' }).
   *
   * Vedi Scheda 08 §"Passare dati e ascoltare eventi" per il flusso.
   */

}
