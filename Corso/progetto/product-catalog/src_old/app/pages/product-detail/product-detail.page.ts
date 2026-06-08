import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../product.model';
import { ProductService } from '../../services/product.service';

/**
 * ProductDetailPage — Pagina dettaglio prodotto
 *
 * Legge il parametro :id dall'URL corrente tramite ActivatedRoute,
 * poi chiama ProductService.getProductById(id) (HTTP GET /products/:id)
 * per caricare i dati del prodotto specifico.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * CONCETTO CHIAVE — ActivatedRoute
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ActivatedRoute è un servizio iniettato automaticamente dal Router.
 * Contiene tutte le informazioni sulla rotta attualmente attiva:
 *
 * route.snapshot.paramMap.get('id')
 * └── snapshot   → stato della rotta al momento del caricamento del componente
 * └── paramMap   → mappa dei parametri di path (:id, :slug, ecc.)
 * └── get('id')  → valore del parametro :id come STRINGA
 *
 * IMPORTANTE: paramMap.get() restituisce sempre una stringa (o null).
 * Devi convertire in number con Number() o parseInt() prima di usarlo.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SNAPSHOT vs OBSERVABLE
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * - snapshot → valore statico al momento del caricamento
 *   Sufficiente per la maggior parte dei casi (navigazione tra pagine diverse)
 *
 * - route.params$ (Observable) → si aggiorna se l'id cambia mentre
 *   il componente rimane montato (es. pulsanti Precedente/Successivo che
 *   cambiano solo l'id nell'URL senza smontare il componente)
 *   Per questo lab, snapshot è sufficiente.
 */
@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.page.html'
})
export class ProductDetailPage implements OnInit {

  /**
   * ActivatedRoute — fornisce informazioni sulla rotta corrente.
   * Il Router lo registra automaticamente — nessuna configurazione extra necessaria.
   */
  private route = inject(ActivatedRoute);

  /**
   * ProductService — per caricare il prodotto specifico.
   * getProductById() chiama HTTP GET /products/:id (json-server).
   */
  private productService = inject(ProductService);

  /** Il prodotto caricato, null prima del caricamento */
  product: Product | null = null;

  /** true se il prodotto non esiste (id non valido o risposta 404) */
  notFound = false;

  /** true mentre la chiamata HTTP è in corso */
  isLoading = true;

  ngOnInit(): void {
    /**
     * STEP 1: leggi il parametro :id dall'URL
     *
     * URL corrente: /products/3
     * route.snapshot.paramMap.get('id') → '3' (stringa)
     * Number('3') → 3 (number)
     *
     * Number(null) → 0 → non corrisponde a nessun prodotto → notFound = true
     */
    const id = Number(this.route.snapshot.paramMap.get('id'));

    /**
     * STEP 2: carica il prodotto con una chiamata HTTP specifica
     *
     * productService.getProductById(id) → Observable<Product>
     * Chiama: GET http://localhost:3000/products/3
     *
     * json-server risponde con:
     * - 200 OK + oggetto Product → next callback
     * - 404 Not Found            → error callback
     */
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: () => {
        // Il prodotto non esiste (json-server risponde 404)
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  /**
   * Aggiunge il prodotto corrente al carrello.
   * Il ! (non-null assertion) è sicuro qui perché onAddToCart()
   * viene chiamato solo dal template quando this.product non è null
   * (il pulsante è visibile solo nel blocco @else if (product)).
   */
  onAddToCart(): void {
    if (this.product) {
      this.productService.addToCart(this.product);
    }
  }
}
