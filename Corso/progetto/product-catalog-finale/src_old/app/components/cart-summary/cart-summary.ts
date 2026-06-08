import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../product.model';

/**
 * CartSummary — SOLUZIONE COMPLETA Lab 05
 * Pannello riepilogo carrello con getter calcolati e tre Output.
 */
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-summary.html'
})
export class CartSummary {

  /**
   * cartItems — @Input() required
   * Array di CartItem ricevuto dall'App.
   */
  @Input({ required: true }) cartItems: CartItem[] = [];

  /**
   * clearCart — emette void: nessun dato da trasportare
   */
  @Output() clearCart = new EventEmitter<void>();

  /**
   * removeItem — emette l'id del prodotto da rimuovere
   */
  @Output() removeItem = new EventEmitter<number>();

  /**
   * totalPrice — getter
   * Prezzo totale: somma (prezzo × quantità) per ogni item.
   * Usiamo un ciclo for...of.
   */
  get totalPrice(): number {
    let total = 0;
    for (const item of this.cartItems) {
      total += item.product.price * item.quantity;
    }
    return total;
  }

  /**
   * totalItems — getter
   * Numero totale di articoli (somma delle quantità).
   */
  get totalItems(): number {
    let count = 0;
    for (const item of this.cartItems) {
      count += item.quantity;
    }
    return count;
  }

  /**
   * onClearCart()
   * emit() senza argomento per EventEmitter<void>
   */
  onClearCart(): void {
    this.clearCart.emit();
  }

  /**
   * onRemoveItem()
   * Emette l'id del prodotto. Il padre usa Array.filter() per rimuoverlo.
   */
  onRemoveItem(productId: number): void {
    this.removeItem.emit(productId);
  }
}
