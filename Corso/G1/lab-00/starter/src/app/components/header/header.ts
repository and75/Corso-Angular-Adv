/**
 * LAB 0 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/header/header.ts
 *
 * Punto di partenza: l'Header attuale espone solo due Input (appName, cartCount)
 * e non inietta nessun servizio. Lo trasformeremo aggiungendo l'iniezione del
 * ProductService e la sottoscrizione a getProducts(), così da mostrare un
 * badge "X in catalogo" sotto al nome dell'app (template in header.html).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, Input } from '@angular/core';
// TODO 1: aggiungi all'import qui sopra anche la funzione moderna per
//         iniettare un servizio come campo della classe, e l'interfaccia
//         del lifecycle hook OnInit.
import { RouterLink, RouterLinkActive } from '@angular/router';
// TODO 1: importa qui sotto la classe ProductService dal file
//         ../../services/product (non product.service — il servizio del seme
//         è in services/product.ts).

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header /* TODO 1: dichiara che implementa OnInit */ {

  /**
   * TODO 1 — [FACILE] Iniettare ProductService come PROPRIETÀ PRIVATA della classe.
   *   Usa la funzione che hai aggiunto agli import (vedi TODO 1 in cima al file).
   *
   *   ATTENZIONE — regola d'oro: la funzione di iniezione si chiama come
   *   inizializzatore di campo (qui), MAI dentro a un metodo. Dentro a
   *   ngOnInit() o a un (click) lancia "NG0203: inject() must be called
   *   from an injection context".
   *
   *   Vedi Scheda 01 §inject() vs constructor injection.
   */

  @Input() appName: string = 'Gianni Store';
  @Input() cartCount: number = 0;

  /**
   * TODO 2 — [MEDIO] Dichiarare una proprietà productCount di tipo number,
   *   inizializzata a 0. È il valore che il template mostrerà nel badge
   *   "X in catalogo".
   */

  /**
   * TODO 2 — [MEDIO] Implementare ngOnInit():
   *   - sottoscrivi productService.getProducts() (Observable<Product[]>)
   *   - nel callback "next": assegna l'array.length a this.productCount
   *   - nel callback "error": assegna 0 (il badge mostrerà "0 in catalogo")
   *
   *   Non serve takeUntilDestroyed: l'Observable di HttpClient.get() emette
   *   un solo valore e poi completa da solo (vedi Scheda 02 §subscribe).
   */
}
