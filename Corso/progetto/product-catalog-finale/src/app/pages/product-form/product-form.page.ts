// product-form.page.ts — SOLUTION mini-lab G2
// Delta rispetto al seme:
//  ✅ TODO 1 — agganciato detailedDescriptionIfAvailable(30) come group-level validator
//  ✅ TODO 2 — agganciato uniqueProductNameValidator come terzo slot del campo "name"

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
import {
  forbiddenWordsValidator,
  detailedDescriptionIfAvailable,
  uniqueProductNameValidator,
} from '../../validators/product.validators';

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
      // ✅ TODO 2: terzo slot async [uniqueProductNameValidator(...)]
      name: [
        '',
        [Validators.required, Validators.minLength(3)],
        [uniqueProductNameValidator(this.productService)],
      ],
      price:       [null, [Validators.required, Validators.min(1)]],
      category:    ['', [Validators.required]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        forbiddenWordsValidator(['sconto', 'gratis', 'offerta', 'promo']),
      ]],
      available:   [true],
    }, {
      // ✅ TODO 1: validator a livello di FormGroup (secondo argomento di fb.group)
      validators: [detailedDescriptionIfAvailable(30)],
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
