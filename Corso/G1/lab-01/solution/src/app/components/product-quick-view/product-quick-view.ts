/**
 * LAB 1 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/product-quick-view/product-quick-view.ts
 *
 * Nuovo componente standalone. Verrà istanziato dinamicamente dalla HomePage
 * con ViewContainerRef.createComponent (Scheda 08).
 *
 * Requisito formale di createComponent: standalone: true.
 * Pattern signal: input.required + output (uniforme col resto del seme).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, input, output, computed } from '@angular/core';
import { Product } from '../../product.model';

@Component({
  selector: 'app-product-quick-view',
  standalone: true,
  templateUrl: './product-quick-view.html',
})
export class ProductQuickView {

  // ✅ signal input richiesto
  product = input.required<Product>();

  // ✅ signal output per chiudere la preview
  close = output<void>();

  // ✅ prezzo formattato derivato dal signal — stesso pattern di ProductCard
  formattedPrice = computed(() =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
      .format(this.product().price)
  );
}
