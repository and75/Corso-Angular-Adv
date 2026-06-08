/**
 * LAB 2 — STARTER (parte da Lab 1 applicato)
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/pages/home/home.page.ts
 *
 * Il mount visivo di <app-carousel ... /> sta nel template home.page.html
 * (TODO 5 lato template). Qui dobbiamo rendere il componente Carousel
 * riconoscibile aggiungendolo agli imports del componente HomePage.
 *
 * Il resto è invariato rispetto al Lab 1 (viewChild quickAnchor + openQuickView).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, inject, ViewContainerRef, viewChild, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductCategory } from '../../product.model';
import { FilterProductsPipe } from '../../pipes/filter-products-pipe';
import { ProductService } from '../../services/product';
import { CartSummary } from '../../components/cart-summary/cart-summary';
import { ProductCard } from '../../components/product-card/product-card';
import { CardContainer } from '../../components/card-container/card-container';
import { ProductQuickView } from '../../components/product-quick-view/product-quick-view';
// TODO 5: importa qui sotto il componente Carousel dal nuovo file
//         '../../components/carousel/carousel' (è quello che hai creato nel TODO 4).

@Component({
  selector: 'app-home-page',
  standalone: true,
  /*
   * TODO 5 — [FACILE] Aggiungere Carousel a questo array imports.
   *   Senza, il template non riconosce il tag <app-carousel ... />.
   */
  imports: [CommonModule, FormsModule, FilterProductsPipe, CartSummary, ProductCard, CardContainer],
  templateUrl: './home.page.html'
})
export class HomePage {

  selectedCategory = 'Tutti';
  searchTerm = '';
  categories: string[] = ['Tutti', ...Object.values(ProductCategory)];

  products: Product[] = [];
  isLoading = true;
  error: string | null = null;

  productService = inject(ProductService);

  // (Lab 1) ancora per createComponent
  private quickAnchor = viewChild('quickViewAnchor', { read: ViewContainerRef });
  private currentQuickView?: ComponentRef<ProductQuickView>;

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: data  => { this.products = data; this.isLoading = false; },
      error: err  => { this.error = err.message || 'Errore sconosciuto'; this.isLoading = false; }
    });
  }

  retry(): void { this.loadProducts(); }

  onSelectCategory(category: string): void { this.selectedCategory = category; }

  get filteredProducts(): Product[] {
    const sorted = [...this.products].sort((a, b) => b.price - a.price);
    return this.selectedCategory === 'Tutti'
      ? sorted
      : sorted.filter(p => p.category === this.selectedCategory);
  }

  getVariant(product: Product): 'default' | 'success' | 'warning' | 'info' {
    if (!product.available) return 'warning';
    if (product.category === ProductCategory.Laptop) return 'info';
    if (product.price > 1000) return 'success';
    return 'default';
  }

  onAddToCart(product: Product): void   { this.productService.addToCart(product); }
  onRemoveItem(productId: number): void { this.productService.removeFromCart(productId); }
  onClearCart(): void                   { this.productService.clearCart(); }

  // (Lab 1) apertura dinamica del ProductQuickView
  openQuickView(p: Product): void {
    const vcr = this.quickAnchor();
    if (!vcr) return;
    vcr.clear();
    const ref = vcr.createComponent(ProductQuickView);
    ref.setInput('product', p);
    ref.instance.close.subscribe(() => vcr.clear());
    this.currentQuickView = ref;
  }
}
