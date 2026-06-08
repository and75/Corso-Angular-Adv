/**
 * LAB 2 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/app.ts
 *
 * Il mount visivo del tag <app-toast /> sta nel template app.html (anche lì
 * c'è un TODO 3). Per renderlo riconoscibile dal compilatore Angular nel
 * template, occorre dichiarare il componente Toast tra gli imports di App.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, inject, computed } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LiveTimer } from './components/live-timer/live-timer';
import { ProductService } from './services/product';
import { RouterOutlet } from '@angular/router';
// TODO 3: importa qui sotto il componente Toast dal nuovo file
//         './components/toast/toast' (è quello che hai creato nei TODO 2).

@Component({
  selector: 'app-root',
  standalone: true,
  /*
   * TODO 3 — [FACILE] Aggiungere Toast a questo array imports.
   *   Senza questa modifica, il template app.html non riconosce il tag
   *   <app-toast /> ed Angular lancia "is not a known element".
   */
  imports: [RouterOutlet, Header, Footer, LiveTimer],
  templateUrl: './app.html'
})
export class App {

  appName = 'Product Store';
  showTimer = true;
  timerFormat: '24h' | '12h' = '24h';

  toggleTimer(): void { this.showTimer = !this.showTimer; }
  switchFormat(): void { this.timerFormat = this.timerFormat === '24h' ? '12h' : '24h'; }

  productService = inject(ProductService);

  readonly itemCount = computed(() => this.productService.itemCount());
}
