// home.page.ts — SOLUZIONE lab-15a
// Delta rispetto a lab-13b:
//   - cartItems: CartItem[] locale RIMOSSO
//   - productService reso pubblico (accessibile dal template)
//   - onAddToCart / onRemoveItem / onClearCart semplificati (no sync manuale)

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductCategory } from '../../product.model';
import { FilterProductsPipe } from '../../pipes/filter-products-pipe';
import { ProductService } from '../../services/product';
import { CartSummary } from '../../components/cart-summary/cart-summary';
import { ProductCard } from '../../components/product-card/product-card';
import { CardContainer } from '../../components/card-container/card-container';

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

  // ✅ pubblico — il template legge productService.cartItems()
  productService = inject(ProductService);

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

  // ✅ Nessuna sincronizzazione manuale — i signal propagano i cambiamenti
  onAddToCart(product: Product): void   { this.productService.addToCart(product); }
  onRemoveItem(productId: number): void { this.productService.removeFromCart(productId); }
  onClearCart(): void                   { this.productService.clearCart(); }
}
