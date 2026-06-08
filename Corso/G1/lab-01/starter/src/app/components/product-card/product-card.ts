/**
 * LAB 1 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/product-card/product-card.ts
 *
 * Per i TODO 1 e 2 del Lab 1 non serve toccare il TypeScript: il refactor
 * multi-slot vive interamente nel template product-card.html.
 * La classe espone già signal input/output corretti — lasciala invariata.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, inject, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './product-card.html',
})
export class ProductCard {

  private router = inject(Router);

  product = input.required<Product>();
  addToCart = output<Product>();

  formattedPrice = computed(() =>
    new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(this.product().price)
  );

  goToDetail(): void {
    this.router.navigate(['/products', this.product().id]);
  }

  onAddToCartClick(): void {
    this.addToCart.emit(this.product());
  }
}
