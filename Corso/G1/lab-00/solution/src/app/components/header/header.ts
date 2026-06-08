/**
 * LAB 0 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/header/header.ts
 *
 * Delta rispetto al seme:
 *  - aggiunti  inject + OnInit  agli import da @angular/core
 *  - aggiunto  import { ProductService } from '../../services/product'
 *  - dichiarato  private productService = inject(ProductService)
 *  - aggiunta proprietà  productCount: number = 0
 *  - implementata OnInit e ngOnInit() che sottoscrive getProducts() e salva la lunghezza
 *
 * Pattern: inject() come inizializzatore di proprietà (vedi Scheda 01),
 * subscribe semplice su Observable di HttpClient (vedi Scheda 02 — niente
 * takeUntilDestroyed necessario perché l'Observable si completa da solo).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header implements OnInit {

  // ✅ inject() come campo della classe — injection context valido
  private productService = inject(ProductService);

  @Input() appName: string = 'Gianni Store';
  @Input() cartCount: number = 0;

  // ✅ Stato locale alimentato dal servizio
  productCount: number = 0;

  ngOnInit(): void {
    // HttpClient emette UN solo valore e poi completa → subscribe diretto va bene
    this.productService.getProducts().subscribe({
      next: (products) => this.productCount = products.length,
      error: () => this.productCount = 0,
    });
  }
}
