/**
 * LAB 2 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/carousel/carousel.ts
 *
 * Wrapper Splide standalone. Pattern Scheda 10 Parte A:
 *   ✅ afterNextRender → DOM montato, SSR-safe (importante per Mod 6)
 *   ✅ runOutsideAngular → animazioni/event-listener di Splide NON scatenano CD
 *   ✅ destroyRef.onDestroy → splide.destroy() garantito su unmount del componente
 *
 * import '@splidejs/splide/css' → stili obbligatori, senza il carousel non si
 * impagina correttamente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  Component, ElementRef, NgZone, DestroyRef, inject,
  afterNextRender, input, viewChild,
} from '@angular/core';
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.html',
})
export class Carousel {

  slides = input.required<string[]>();

  private zone       = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  // Reference al <section> nel template — required perché la mount lo richiede
  private host = viewChild.required<ElementRef<HTMLElement>>('host');

  private splide?: Splide;

  constructor() {
    afterNextRender(() => {
      // ✅ Tutta la mount + ciclo Splide fuori zone
      this.zone.runOutsideAngular(() => {
        this.splide = new Splide(this.host().nativeElement, {
          type: 'loop',
          perPage: 1,
          autoplay: true,
          interval: 3000,
        });
        this.splide.mount();
      });
    });

    // ✅ Cleanup garantito
    this.destroyRef.onDestroy(() => this.splide?.destroy());
  }
}
