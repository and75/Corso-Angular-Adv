/**
 * LAB 03 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: components/footer/footer.ts
 *
 * Il componente FOOTER è la barra in fondo alla pagina.
 * È il più semplice dei tre — non riceve input né emette eventi.
 * Mostra solo informazioni statiche (anno e nome app).
 *
 * CONCETTO — Componenti senza @Input()/@Output():
 * Non tutti i componenti devono comunicare con il padre.
 * Il Footer è un esempio di componente "presentazionale puro":
 * riceve solo dati statici interni e non ha logica interattiva.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
})
export class Footer {

  /**
   * currentYear
   * Anno corrente calcolato dinamicamente.
   * Usare new Date().getFullYear() invece del numero statico (es. 2026)
   * garantisce che il footer mostri sempre l'anno corretto senza
   * bisogno di aggiornare il codice ogni anno.
   *
   * Proprietà già fornita — non modificare.
   */
  currentYear: number = new Date().getFullYear();

  /**
   * appName
   * Nome dell'applicazione mostrato nel footer.
   *
   * ✅ TODO [FACILE]: Cambia il valore di appName con il nome che preferisci
   * (es. 'Angular Product Catalog' oppure 'Il mio negozio').
   */
  appName: string = 'Gianni Store';

}
