// product.service.ts — SOLUZIONE
// Servizio completo con metodi GET e POST per il catalogo prodotti.

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  description: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/products';

  // Recupera tutti i prodotti (GET /products)
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // ✅ TODO 3 — SOLUZIONE
  // Invia un nuovo prodotto al server tramite HTTP POST.
  //
  // HttpClient.post<T>(url, body) fa:
  //   1. Serializza 'product' in JSON (Content-Type: application/json)
  //   2. Invia la richiesta POST a this.apiUrl
  //   3. Deserializza la risposta JSON nel tipo T (Product)
  //
  // json-server risponde con il prodotto creato incluso il nuovo 'id'
  // auto-generato (es. { id: 7, name: "...", ... }).
  //
  // Restituiamo Observable<Product> perché la chiamata è asincrona:
  // il componente si sottoscriverà per ricevere la risposta.
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
}
