import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CartItem } from '../../product.model';
import { CurrencyPipe, formatCurrency } from '@angular/common';

@Component({
  selector: 'app-cart-summary',
  imports: [CurrencyPipe],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.css',
})
export class CartSummary {
  @Input({ required: true }) cartItems: CartItem[] = [];

  @Output() clearCart = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<number>(); // id del prodotto da rimuovere

  get totalPrice(): number {
    //return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    let total = 0;
    for (const item of this.cartItems) {
      total += item.product.price * item.quantity;
    }
    return total;
  }

  get totalItems(): number {
    //return this.items.reduce((total, item) => total + item.quantity, 0);
    let total = 0;
    for (const item of this.cartItems) {
      total += item.quantity;
    }
    return total;
  }

  onClearCart(): void { this.clearCart.emit(); }
  onRemoveItem(productId: number): void { this.removeItem.emit(productId); }

}
