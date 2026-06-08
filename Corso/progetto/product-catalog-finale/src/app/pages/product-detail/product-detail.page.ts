// product-detail.page.ts — SOLUZIONE lab-detail
// Pagina dettaglio prodotto: legge :id dall'URL, carica con HTTP, mostra scheda.

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { Product } from '../../product.model';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPage implements OnInit {

  // inject() funziona come il costruttore ma nei field initializer
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private productService = inject(ProductService);

  // Stato locale: signal<T | null> comunica "dato non ancora disponibile"
  product   = signal<Product | null>(null);
  isLoading = signal(true);
  error     = signal('');

  ngOnInit(): void {
    // snapshot.paramMap.get() restituisce sempre una stringa o null
    // Number() converte '3' → 3, 'abc' → NaN (falsy)
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      // id non valido → torniamo alla home invece di mostrare un errore
      this.router.navigate(['/home']);
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: (p) => {
        this.product.set(p);      // signal aggiornato → template si ri-renderizza
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Prodotto non trovato.');
        this.isLoading.set(false);
      },
    });
  }

  onAddToCart(): void {
    const p = this.product();
    if (p) this.productService.addToCart(p);
  }
}
