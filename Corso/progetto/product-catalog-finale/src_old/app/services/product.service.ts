import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Product, CartItem } from '../product.model';

/**
 * ProductService — Servizio dati del catalogo
 *
 * EVOLUZIONE DEL SERVIZIO:
 * - Lab 09: dati hardcoded, metodi sincroni
 * - Lab 10: HttpClient, getProducts() → Observable<Product[]>
 * - Lab 11: aggiunto getProductById(id) → Observable<Product>
 *           per caricare un singolo prodotto per la pagina dettaglio
 *
 * ENDPOINT API (json-server locale):
 * GET /products       → restituisce Product[] (tutti i prodotti)
 * GET /products/:id   → restituisce Product (singolo prodotto, 404 se non esiste)
 *
 * json-server legge db.json e crea automaticamente questi endpoint.
 * Il modello Product corrisponde esattamente alla struttura in db.json —
 * nessun mapping necessario.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {

  private readonly API_URL = 'http://localhost:3000/products';

  /**
   * inject(HttpClient) — stile moderno (equivalente al constructor injection).
   * HttpClient è disponibile perché provideHttpClient() è in app.config.ts.
   */
  private http = inject(HttpClient);

  /** Carrello: array privato gestito solo tramite i metodi del servizio */
  private cartItems: CartItem[] = [];

  /**
   * getProducts() — carica tutti i prodotti
   *
   * GET http://localhost:3000/products → Product[]
   * json-server risponde direttamente con un array — nessun mapping necessario.
   *
   * Observable<Product[]>: il componente si sottoscrive con .subscribe()
   * e riceve i dati nel callback next: quando arriva la risposta HTTP.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL).pipe(
      catchError(err => {
        console.error('Errore GET /products:', err);
        return throwError(() => new Error('Impossibile caricare i prodotti. json-server attivo?'));
      })
    );
  }

  /**
   * getProductById() — carica un singolo prodotto per id
   *
   * GET http://localhost:3000/products/3 → Product (singolo oggetto)
   * json-server risponde con 404 se l'id non esiste → Observable andrà in errore.
   *
   * La ProductDetailPage gestisce l'errore impostando notFound = true.
   *
   * @param id - Id del prodotto (number)
   * @returns Observable<Product> — emette una volta e si completa
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`).pipe(
      catchError(err => {
        console.error(`Errore GET /products/${id}:`, err);
        return throwError(() => new Error('Prodotto non trovato'));
      })
    );
  }

  // ─── Gestione Carrello ────────────────────────────────────────────────────

  /** Aggiunge un prodotto al carrello (incrementa quantità se già presente) */
  addToCart(product: Product): void {
    const existing = this.cartItems.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ product, quantity: 1 });
    }
  }

  /** Rimuove un prodotto dal carrello per id */
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(i => i.product.id !== productId);
  }

  /** Svuota il carrello */
  clearCart(): void {
    this.cartItems = [];
  }

  /** Restituisce una copia degli item nel carrello */
  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  /**
   * Numero totale di articoli (somma le quantità).
   * Usato dal badge nell'App per mostrare il contatore.
   */
  getTotalCartItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /** Prezzo totale del carrello */
  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
}
