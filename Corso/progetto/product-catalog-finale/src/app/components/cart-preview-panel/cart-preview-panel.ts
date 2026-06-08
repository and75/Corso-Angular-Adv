// components/cart-preview-panel/cart-preview-panel.ts — SOLUTION Lab 3 G2
// Wrapper attorno a CartSummary, montato nel named outlet "panel" del Lab 3.

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartSummary } from '../cart-summary/cart-summary';

@Component({
  selector: 'app-cart-preview-panel',
  standalone: true,
  imports: [CartSummary],
  template: `
    <header class="flex justify-between items-center p-4 border-b">
      <h2 class="font-bold text-teal-700">Anteprima carrello</h2>
      <button (click)="close()" class="text-gray-400 hover:text-gray-700 text-lg leading-none">
        ✕
      </button>
    </header>
    <div class="p-4">
      <app-cart-summary
        [cartItems]="productService.cartItems()"
        (clearCart)="productService.clearCart()"
        (removeItem)="productService.removeFromCart($event)"
      />
    </div>
  `,
})
export class CartPreviewPanel {

  // ✅ PUBBLICO: il template lo legge direttamente
  productService = inject(ProductService);

  private router = inject(Router);

  close(): void {
    // ✅ null (non undefined): smonta il named outlet e ripulisce l'URL
    this.router.navigate([{ outlets: { panel: null } }]);
  }
}
