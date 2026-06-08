// header.ts — SOLUTION Lab 3 G2
// Nessuna modifica TypeScript rispetto allo stato post-Lab 0. Il TODO 5 vive solo nel template.

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

  private productService = inject(ProductService);

  @Input() appName: string = 'Gianni Store';
  @Input() cartCount: number = 0;

  productCount: number = 0;

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => this.productCount = products.length,
      error: () => this.productCount = 0,
    });
  }
}
