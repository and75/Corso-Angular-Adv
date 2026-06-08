/**
 * LAB 1 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/pages/home/home.page.ts
 *
 * Delta rispetto al seme:
 *   ✅ TODO 5 — import { ViewContainerRef, viewChild, ComponentRef } da @angular/core
 *              + import ProductQuickView
 *              + dichiarate due proprietà private quickAnchor (viewChild) e currentQuickView
 *   ✅ TODO 6 — implementato openQuickView(p: Product) con pattern compatto:
 *              clear() preventivo + createComponent + setInput + subscribe(close → clear)
 *   ⏭️ TODO 7 (opzionale) — NON applicato: il cleanup esplicito su destroyRef sarebbe
 *              ridondante (Angular distrugge il VCR insieme all'host).
 *
 * Pattern Scheda 08:
 *   - viewChild('quickViewAnchor', { read: ViewContainerRef }) per il punto di montaggio
 *   - createComponent(ProductQuickView) — requisito: componente standalone (sì, lo è)
 *   - setInput('product', p) — via ufficiale per signal input
 *   - instance.close.subscribe(() => vcr.clear()) — chiusura dalla preview
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

@Component({
  selector: 'app-home-page',
  standalone: true,
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

  // ✅ TODO 5 — punto di montaggio del componente dinamico
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

  // ✅ TODO 6 — apertura dinamica del ProductQuickView
  openQuickView(p: Product): void {
    const vcr = this.quickAnchor();
    if (!vcr) return;             // safe-guard: viewChild può essere undefined al primo CD

    vcr.clear();                  // pulizia preventiva: niente accumulo se cliccano più volte

    const ref = vcr.createComponent(ProductQuickView);
    ref.setInput('product', p);

    // Cleanup quando la preview emette close
    ref.instance.close.subscribe(() => vcr.clear());

    this.currentQuickView = ref;
  }
}
