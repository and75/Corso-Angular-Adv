// product.ts — SOLUZIONE lab-finale
// Delta rispetto a lab-15b: aggiunta hasItems computed

import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, CartItem } from '../product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly API_URL = 'http://localhost:3000/products';
  private http = inject(HttpClient);

  cartItems = signal<CartItem[]>([]);

  itemCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  cartTotal = computed(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  );

  // ✅ NUOVO in lab-finale — evita di scrivere cartItems().length > 0 nel template
  readonly hasItems = computed(() => this.cartItems().length > 0);

  constructor() {
    effect(() => {
      console.log('[ProductService] Carrello aggiornato:', this.cartItems().length, 'articoli');
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL).pipe(
      catchError(err => {
        console.error('Errore caricamento prodotti:', err);
        return throwError(() => new Error(
          'Impossibile caricare i prodotti. Assicurati che json-server sia in esecuzione.'
        ));
      })
    );
  }

  getProductById(id:string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`).pipe(
      catchError(() => throwError(() => new Error(`Prodotto con id ${id} non trovato.`)))
    );
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  addToCart(product: Product): void {
    this.cartItems.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: number): void {
    this.cartItems.update(items =>
      items.filter(i => i.product.id !== productId)
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}
