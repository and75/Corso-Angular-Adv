import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Product } from '../../product.model';

/**
 * ProductCard — SOLUZIONE COMPLETA Lab 05
 * @Input() product — il prodotto da visualizzare
 * @Output() addToCart — emette il prodotto intero quando si clicca "Aggiungi"
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './product-card.html'
})
export class ProductCard {

  @Input({ required: true }) product!: Product;

  /**
   * addToCart — emette il prodotto intero al padre
   */
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }
}
