// features/admin/pages/admin-list/admin-list.ts — SOLUTION Lab 3 G2
// Lista prodotti admin con filtri e paginazione in querystring.
// Pattern Scheda 02 G2: signal locali alimentati da queryParamMap (Observable) + navigate con merge.

import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../../services/product';
import { Product } from '../../../../product.model';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './admin-list.html',
})
export class AdminList {

  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  private svc        = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  readonly products = signal<Product[]>([]);
  readonly q        = signal('');
  readonly page     = signal(1);

  readonly PAGE_SIZE = 3;

  // computed: filtro + slice per la pagina corrente
  readonly pagedProducts = computed(() => {
    const filtered = this.filteredProducts();
    const start = (this.page() - 1) * this.PAGE_SIZE;
    return filtered.slice(start, start + this.PAGE_SIZE);
  });

  // computed di supporto, usato anche per il numero totale di pagine
  private readonly filteredProducts = computed(() => {
    const term = this.q().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(p => p.name.toLowerCase().includes(term));
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredProducts().length / this.PAGE_SIZE))
  );

  constructor() {
    // ✅ 1 — carico i prodotti dal service una sola volta
    this.svc.getProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(list => this.products.set(list));

    // ✅ 2 — aggancio reattivo alla querystring (rispetta back/forward del browser)
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(p => {
        this.q.set(p.get('q') ?? '');
        this.page.set(Number(p.get('page') ?? '1'));
      });
  }

  onSearch(value: string): void {
    // Cambia search → reset page a 1 (comportamento UX standard).
    // queryParamsHandling: 'merge' conserva altri queryparam eventualmente presenti.
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  goToPage(n: number): void {
    if (n < 1 || n > this.totalPages()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: n },
      queryParamsHandling: 'merge',
    });
  }
}
