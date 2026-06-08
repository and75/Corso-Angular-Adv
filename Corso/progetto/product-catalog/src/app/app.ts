// app.ts — SOLUZIONE lab-15a

import { Component, inject, computed } from '@angular/core';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LiveTimer } from './components/live-timer/live-timer';
import { ProductService } from './services/product';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, LiveTimer],
  templateUrl: './app.html'
})
export class App {

  appName = 'Product Store';
  showTimer = true;
  timerFormat: '24h' | '12h' = '24h';

  toggleTimer(): void { this.showTimer = !this.showTimer; }
  switchFormat(): void { this.timerFormat = this.timerFormat === '24h' ? '12h' : '24h'; }

  // ✅ pubblico — usato dal computed qui sotto
  productService = inject(ProductService);

  // ✅ computed derivato da productService.itemCount()
  // Si ricalcola automaticamente quando il carrello cambia
  readonly itemCount = computed(() => this.productService.itemCount());
}
