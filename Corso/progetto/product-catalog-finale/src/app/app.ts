/**
 * LAB 2 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/app.ts
 *
 * Delta rispetto al seme:
 *   ✅ TODO 3 — aggiunto import { Toast } e aggiunto Toast agli imports del componente
 *
 * Il mount visivo è in app.html (anche lì TODO 3).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, inject, computed } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LiveTimer } from './components/live-timer/live-timer';
import { ProductService } from './services/product';
import { RouterOutlet } from '@angular/router';
import { Toast } from './components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, LiveTimer, Toast],
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
