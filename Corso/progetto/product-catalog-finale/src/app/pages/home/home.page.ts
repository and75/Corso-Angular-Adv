/**
 * LAB 2 — SOLUTION (parte da Lab 1 applicato)
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/pages/home/home.page.ts
 *
 * Delta rispetto al Lab 1:
 *   ✅ TODO 5 — aggiunto import { Carousel } e Carousel aggiunto agli imports
 *
 * Il mount visivo del <app-carousel /> è in home.page.html (anche lì TODO 5).
 * Il resto è invariato (logica del Lab 1 invariata).
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
import { Carousel } from '../../components/carousel/carousel';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterProductsPipe, CartSummary, ProductCard, CardContainer, Carousel],
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
