// product-card.ts — SOLUZIONE lab-15b
// Delta rispetto a lab-detail:
//   TODO 1 — import: Input/Output/EventEmitter → input/output/computed (inject resta per Router)
//   TODO 2 — @Input() product!: Product          → product = input.required<Product>()
//   TODO 3 — @Output() addToCart = new EventEmitter<Product>() → addToCart = output<Product>()
//   TODO 4 — formattedPrice = computed(() => Intl.NumberFormat(...).format(product().price))
//   TODO 5 — template: product.xxx → product().xxx (nel file .html)

import { Component, inject, input, output, computed } from '@angular/core';
// inject()   → ancora necessario per Router (goToDetail)
// input()    → Signal Input (sostituisce @Input() + decoratore, read-only)
// output()   → Signal Output (sostituisce @Output() + EventEmitter)
// computed() → valore derivato, ricalcolato automaticamente quando input() cambia

import { NgClass } from '@angular/common';
// CurrencyPipe rimossa: il prezzo è ora formattato da computed()
// NgClass mantenuta: serve per [ngClass] nel template

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

  // ✅ TODO 2 — Signal Input obbligatorio
  // input.required<Product>() è read-only e garantisce che il padre fornisca sempre il valore.
  // Si legge con: this.product()  (TypeScript) / product()  (template)
  product = input.required<Product>();

  // ✅ TODO 3 — Signal Output
  // output<Product>() sostituisce @Output() + EventEmitter.
  // Il padre continua a usare (addToCart)="handler($event)" — nessun cambiamento.
  addToCart = output<Product>();

  // ✅ TODO 4 — computed: prezzo formattato in italiano
  // Si ricalcola automaticamente quando product() cambia.
  // Intl.NumberFormat('it-IT', 'EUR') → "1.299,00 €"
  formattedPrice = computed(() =>
    new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(this.product().price)
  );

  goToDetail(): void {
    // product() con () → legge il valore corrente del Signal Input
    this.router.navigate(['/products', this.product().id]);
  }

  onAddToCartClick(): void {
    // product() con () → legge il valore corrente del Signal Input
    this.addToCart.emit(this.product());
  }
}
