// product-form.page.ts — SOLUZIONE lab-14
// Delta rispetto a lab-13b: aggiunto forbiddenWordsValidator sulla description.

import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../services/product';
import { ProductCategory } from '../../product.model';
import { forbiddenWordsValidator } from '../../validators/product.validators';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.page.html',
})
export class ProductFormPage implements OnInit {

  private fb             = inject(FormBuilder);
  private productService = inject(ProductService);

  productForm!: FormGroup;
  successMessage = '';
  errorMessage   = '';
  isLoading      = false;

  categories = Object.values(ProductCategory);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(3)]],
      price:       [null, [Validators.required, Validators.min(1)]],
      category:    ['', [Validators.required]],
      // ✅ NUOVO: forbiddenWordsValidator blocca parole promozionali
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        forbiddenWordsValidator(['sconto', 'gratis', 'offerta', 'promo']),
      ]],
      available:   [true],
    });
  }

  isInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (!control) return '';
    if (control.hasError('required'))  return 'Campo obbligatorio.';
    if (control.hasError('minlength')) {
      const err = control.getError('minlength');
      return `Minimo ${err.requiredLength} caratteri.`;
    }
    if (control.hasError('min')) {
      const err = control.getError('min');
      return `Il valore minimo è ${err.min}.`;
    }
    // ✅ NUOVO: gestione errore custom forbiddenWord
    if (control.hasError('forbiddenWord')) {
      const err = control.getError('forbiddenWord');
      return `La descrizione non può contenere la parola "${err.word}".`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage   = '';

    this.productService.addProduct(this.productForm.value).subscribe({
      next: () => {
        this.successMessage = 'Prodotto aggiunto con successo!';
        this.productForm.reset({ available: true });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Errore durante il salvataggio. Riprova.';
        this.isLoading = false;
      },
    });
  }
}
