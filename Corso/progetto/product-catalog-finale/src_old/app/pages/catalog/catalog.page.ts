import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../product.model';
import { ProductService } from '../../services/product.service';
import { ProductCard } from '../../components/product-card/product-card';


/**
 * CatalogPage — Pagina lista prodotti
 *
 * Eredita e centralizza la logica che era distribuita in App:
 * - Caricamento prodotti via HTTP (productService.getProducts() → Observable)
 * - Gestione stati loading / error / data
 * - Ricerca testuale tramite SearchBar
 * - Navigazione al dettaglio con router.navigate()
 * - Aggiunta al carrello via ProductService (singleton)
 *
 * PATTERN ADOTTATO — Stato locale del componente:
 *   isLoading = true    → mentre la richiesta HTTP è in volo
 *   error = null        → nessun errore
 *   products = []       → vuoto prima della risposta
 *
 * Quando l'Observable emette (next):
 *   products = dati ricevuti
 *   isLoading = false
 *
 * Se l'Observable errora (error):
 *   error = messaggio
 *   isLoading = false
 *
 * NAVIGAZIONE PROGRAMMATICA vs DICHIARATIVA:
 * - Dichiarativa (template): [routerLink]="['/products', product.id]"
 * - Programmatica (TS):      router.navigate(['/products', product.id])
 * Usiamo router.navigate() qui perché la navigazione parte da un evento
 * (Output del componente figlio) — più naturale gestirla nel codice.
 */
@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductCard,
  ],
  templateUrl: './catalog.page.html'
})
export class CatalogPage implements OnInit {

  /**
   * inject() — iniezione funzionale (Angular 14+)
   * Alternativa al constructor injection:
   *   constructor(private productService: ProductService, private router: Router) {}
   *
   * inject() è preferito nello stile moderno perché:
   * - Più conciso
   * - Non richiede il modificatore private nel constructor
   * - Funziona anche nelle funzioni al di fuori delle classi (es. guard, interceptor)
   */
  private productService = inject(ProductService);
  private router = inject(Router);

  /** Lista prodotti ricevuta dall'API */
  products: Product[] = [];

  /** true mentre la chiamata HTTP è in corso */
  isLoading = true;

  /** Messaggio di errore, null se nessun errore */
  error: string | null = null;

  /** Termine di ricerca corrente (legato a SearchBar) */
  searchTerm = '';

  /**
   * ngOnInit() — lifecycle hook
   * Eseguito UNA VOLTA dopo che Angular ha creato il componente e impostato gli Input.
   * Posto ideale per le chiamate HTTP iniziali.
   *
   * Alternativa (meno comune): inizializzare direttamente la proprietà:
   *   products$ = this.productService.getProducts();
   * e usare async pipe nel template (vedremo nei lab avanzati).
   */
  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      /**
       * next → callback chiamata quando l'Observable emette un valore.
       * Con HttpClient, viene chiamata UNA SOLA VOLTA con la risposta HTTP.
       * L'Observable si completa automaticamente dopo la prima emissione.
       */
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      /**
       * error → callback chiamata se la richiesta HTTP fallisce.
       * Possibili cause: server offline, errore 404/500, timeout, problemi di rete.
       * Dopo l'errore, l'Observable non emetterà più valori.
       */
      error: (err) => {
        this.error = 'Errore nel caricamento: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  /**
   * Riceve il termine di ricerca dal SearchBar.
   * SearchBar emette (searchChange) ad ogni keystroke.
   * Il valore viene passato a FilterProductsPipe nel template.
   */
  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  /**
   * Aggiunge un prodotto al carrello.
   * Deleghiamo al servizio — il componente non sa COME funziona il carrello.
   * Il badge nell'App si aggiorna automaticamente (stesso singleton).
   */
  onAddToCart(product: Product): void {
    this.productService.addToCart(product);
  }

  /**
   * Naviga alla pagina dettaglio del prodotto selezionato.
   *
   * router.navigate(['/products', productId]) costruisce il path:
   *   ['/products', 1]  → '/products/1'
   *   ['/products', 42] → '/products/42'
   *
   * Gli elementi dell'array vengono uniti con '/':
   * - Il primo elemento inizia con '/' → path assoluto
   * - Gli elementi successivi sono segmenti del path
   *
   * @param productId - Id del prodotto su cui l'utente ha cliccato
   */
  onViewDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}
