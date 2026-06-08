// checkout.page.ts — SOLUZIONE lab-finale

import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.page.html',
})
export class CheckoutPage implements OnInit {

  private router         = inject(Router);
  private fb             = inject(FormBuilder);
  private productService = inject(ProductService);

  // ─── Signal / Computed dal servizio ──────────────────────────────────────
  // Assegniamo i signal del servizio a proprietà locali — più leggibile nel template
  readonly cartItems = this.productService.cartItems;
  readonly cartTotal = this.productService.cartTotal;
  readonly hasItems  = this.productService.hasItems;

  // computed locale: somma quantità per "X articoli"
  readonly itemCount = computed(() =>
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  // ─── Reactive Form ───────────────────────────────────────────────────────
  checkoutForm!: FormGroup;

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      customerName: ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      address:      ['', [Validators.required, Validators.minLength(10)]],
      notes:        [''],  // opzionale — nessun validatore
    });
  }

  // Helper per validazione nel template: campo invalid + touched
  isInvalid(field: string): boolean {
    const ctrl = this.checkoutForm?.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  // Integra tutto il corso: Reactive Forms + Signals + Routing
  onSubmit(): void {
    // 1. Guard: form invalido → mostra tutti gli errori e blocca
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    // 2. Costruisce l'oggetto ordine unendo form + carrello
    const order = {
      ...this.checkoutForm.value,           // customerName, email, address, notes
      items:     this.cartItems(),          // CartItem[] dal signal
      total:     this.cartTotal(),          // totale calcolato dal computed
      createdAt: new Date().toISOString(),  // timestamp ISO 8601
    };

    // 3. Placeholder per HTTP POST (in produzione: orderService.create(order))
    console.log('Ordine inviato:', order);

    // 4. Svuota il carrello → itemCount() → 0 → badge sparisce automaticamente
    this.productService.clearCart();

    // 5. Redirect alla home (catalogo)
    this.router.navigate(['/home']);
  }
}
