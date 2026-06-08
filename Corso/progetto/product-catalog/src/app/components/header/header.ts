/**
 * LAB 04 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: components/header/header.ts
 *
 * EVOLUZIONE: appName è ora un @Input() — il padre può passarlo dinamicamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {

  /**
   * @Input() appName
   * Nome dell'applicazione, ricevuto dal padre con:
   *   <app-header [appName]="appName" />
   *
   * Il default 'Product Catalog' garantisce che il componente funzioni
   * anche se usato senza il binding (retro-compatibilità con Lab 03).
   */
  @Input() appName: string = 'Gianni Store';

  /**
   * @Input() cartCount
   * Contatore articoli nel carrello — già @Input() dal Lab 03.
   */
  @Input() cartCount: number = 0;

}
