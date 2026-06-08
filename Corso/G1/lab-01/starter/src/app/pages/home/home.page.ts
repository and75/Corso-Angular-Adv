/**
 * LAB 1 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/pages/home/home.page.ts
 *
 * Da questo file gestiremo l'apertura dinamica della ProductQuickView
 * (TODO 5–6) e — opzionalmente — un cleanup esplicito a destroy (TODO 7).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductCategory } from '../../product.model';
import { FilterProductsPipe } from '../../pipes/filter-products-pipe';
import { ProductService } from '../../services/product';
import { CartSummary } from '../../components/cart-summary/cart-summary';
import { ProductCard } from '../../components/product-card/product-card';
import { CardContainer } from '../../components/card-container/card-container';
// TODO 5: aggiungi all'import di '@angular/core' tre simboli che servono per
//         istanziare componenti dinamicamente:
//          - il tipo del container dove monteremo il componente
//          - la funzione moderna per leggere un riferimento dal template come signal
//          - il tipo che rappresenta il riferimento al componente creato dinamicamente
// TODO 5: importa qui sotto il componente ProductQuickView dal nuovo file.

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterProductsPipe, CartSummary, ProductCard, CardContainer],
  templateUrl: './home.page.html'
})
export class HomePage {

  selectedCategory = 'Tutti';
  searchTerm = '';
  categories: string[] = ['Tutti', ...Object.values(ProductCategory)];

  products: Product[] = [];
  isLoading = true;
  error: string | null = null;

  productService = inject(ProductService);

  /**
   * TODO 5 — [MEDIO] Dichiarare due proprietà private:
   *
   *  1. quickAnchor : signal che punta al ViewContainerRef dell'ancora con
   *     reference variable "quickViewAnchor" nel template (vedi TODO 5
   *     in home.page.html). La sintassi è:
   *       viewChild('NOME_REFERENCE', { read: ViewContainerRef })
   *
   *     La chiave { read: ViewContainerRef } è OBBLIGATORIA: senza, ricevi
   *     un ElementRef e non puoi chiamare createComponent (vedi Scheda 08
   *     §"viewChild con { read: ViewContainerRef }").
   *
   *  2. currentQuickView : opzionale ComponentRef<ProductQuickView>, per
   *     tenere il riferimento all'eventuale preview attualmente montata
   *     (utile per il TODO 7 esplicito, e in generale buona abitudine).
   */

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: data  => { this.products = data; this.isLoading = false; },
      error: err  => { this.error = err.message || 'Errore sconosciuto'; this.isLoading = false; }
    });
  }

  retry(): void { this.loadProducts(); }

  onSelectCategory(category: string): void { this.selectedCategory = category; }

  get filteredProducts(): Product[] {
    const sorted = [...this.products].sort((a, b) => b.price - a.price);
    return this.selectedCategory === 'Tutti'
      ? sorted
      : sorted.filter(p => p.category === this.selectedCategory);
  }

  getVariant(product: Product): 'default' | 'success' | 'warning' | 'info' {
    if (!product.available) return 'warning';
    if (product.category === ProductCategory.Laptop) return 'info';
    if (product.price > 1000) return 'success';
    return 'default';
  }

  onAddToCart(product: Product): void   { this.productService.addToCart(product); }
  onRemoveItem(productId: number): void { this.productService.removeFromCart(productId); }
  onClearCart(): void                   { this.productService.clearCart(); }

  /**
   * TODO 6 — [MEDIO] Implementare openQuickView(p: Product) sotto.
   *
   *   Pattern compatto della Scheda 08 §"Cleanup":
   *
   *    1. Ottieni il ViewContainerRef leggendo il signal quickAnchor (è una
   *       funzione: quickAnchor()). Può essere undefined al primissimo
   *       change detection — fai un early return se è undefined.
   *
   *    2. PULIZIA PREVENTIVA: chiama clear() sul container. Serve nel caso
   *       l'utente apra una seconda preview mentre la prima è ancora a video:
   *       distrugge le view precedenti, libera i loro listener e completa
   *       i loro output.
   *
   *    3. Crea il componente dinamicamente con createComponent(ProductQuickView).
   *       Il metodo restituisce un ComponentRef<ProductQuickView>; tienilo
   *       in una const locale e salvalo anche in this.currentQuickView per
   *       il riferimento futuro.
   *
   *    4. Imposta l'input "product" con setInput. Vincolo: USARE setInput,
   *       NON instance.product = p — l'assegnazione diretta bypassa il
   *       binding di un signal input e i CD/effect non lo "vedono"
   *       (Scheda 08 §"Errori comuni" #2).
   *
   *    5. Sottoscriviti all'output close di ref.instance: quando la preview
   *       emette close, chiama clear() sul container per smontarla. È il
   *       cleanup automatico legato al singolo lifecycle della preview.
   */
  // openQuickView(p: Product): void { /* implementa qui */ }


  /**
   * TODO 7 — [DIFFICILE / opzionale] Cleanup esplicito a destroy della pagina.
   *
   *   Se l'utente naviga via dalla home con la quick-view aperta, Angular
   *   distrugge il ViewContainerRef e con esso le view montate — quindi
   *   il cleanup avviene comunque. Tuttavia, in code review è buona pratica
   *   essere ESPLICITI:
   *
   *    - Inietta DestroyRef nel componente (proprietà privata).
   *    - Nel constructor, registra destroyRef.onDestroy(() => ...) che chiama
   *      destroy() sull'eventuale currentQuickView ancora attiva.
   *
   *   Decidi tu se applicarlo: in questo lab non è obbligatorio, ma il
   *   docente potrebbe chiedertelo durante il recap.
   */
}
