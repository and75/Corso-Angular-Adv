import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductCategory } from '../../product.model';
import { ProductCard } from '../product-card/product-card';

/**
 * ProductList — SOLUZIONE COMPLETA
 * Componente "dumb" che filtra e visualizza i prodotti in griglia.
 *
 * Flusso dati:
 *   App → [products] → ProductList → getter filteredProducts → @for nel template
 *   App → [selectedCategory] → ProductList → getter usa per filtrare
 *   ProductCard → (addToCart) → ProductList → (addToCart) → App (relay)
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html'
})
export class ProductList {

  /** Lista completa dei prodotti, ricevuta dal padre */
  @Input() products: Product[] = [];

  /** Categoria selezionata per il filtro. null = mostra tutti */
  @Input() selectedCategory: ProductCategory | null = null;

  /** Evento emesso quando l'utente aggiunge un prodotto al carrello */
  @Output() addToCart = new EventEmitter<Product>();

  /**
   * filteredProducts (getter)
   *
   * Se selectedCategory è null, ritorna tutti i prodotti.
   * Altrimenti filtra con Array.filter() confrontando la categoria.
   *
   * Il getter viene ricalcolato automaticamente ad ogni change detection —
   * quando gli @Input() cambiano, Angular ri-valuta il template e chiama il getter.
   */
  get filteredProducts(): Product[] {
    if (!this.selectedCategory) {
      return this.products;
    }
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  /**
   * onAddToCart() — relay pattern
   * Riceve l'evento dal figlio (ProductCard) e lo ri-emette verso il padre (App).
   */
  onAddToCart(product: Product): void {
    this.addToCart.emit(product);
  }
}
