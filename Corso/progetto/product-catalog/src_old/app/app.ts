import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ProductService } from './services/product.service';

/**
 * App — Componente radice (shell) dell'applicazione
 *
 * CON IL ROUTING, App cambia completamente ruolo:
 *
 * PRIMA (lab precedenti):
 *   App gestiva prodotti, carrello, ricerca, filtri, overlay dettaglio
 *
 * ORA:
 *   App è solo la "cornice" → navbar fissa + <router-outlet>
 *   Tutto il contenuto viene gestito dalle pagine di routing:
 *   • CatalogPage    → lista prodotti + ricerca
 *   • ProductDetailPage → dettaglio singolo prodotto
 *   • HomePage       → benvenuto
 *   • NotFoundPage   → 404
 *
 * App mantiene solo il badge carrello perché è globale (visibile ovunque).
 * Può farlo perché ProductService è un singleton → condiviso con tutte le pagine.
 *
 * IMPORTS:
 * - RouterOutlet     → il "punto di montaggio" dove Angular inserisce il componente attivo
 * - RouterLink       → direttiva per [routerLink] → navigazione senza reload
 * - RouterLinkActive → direttiva per routerLinkActive → aggiunge classi CSS al link attivo
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html'
})
export class App {

  /**
   * ProductService iniettato per leggere il contatore del carrello.
   *
   * Il servizio è singleton (providedIn: 'root') → è la STESSA istanza
   * di quella usata da CatalogPage e ProductDetailPage.
   * Quando CatalogPage chiama addToCart(), il getter cartCount qui
   * viene aggiornato automaticamente al prossimo change detection cycle.
   */
  private productService = inject(ProductService);

  /**
   * Getter per il badge carrello nella navbar.
   *
   * Un getter viene ricalcolato ad ogni change detection cycle di Angular.
   * Per valori semplici come questo (una chiamata a un servizio), è perfetto.
   */
  get cartCount(): number {
    return this.productService.getTotalCartItems();
  }
}
