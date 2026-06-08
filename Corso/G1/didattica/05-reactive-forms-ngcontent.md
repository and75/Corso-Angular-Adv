# 05 — Reactive Forms base + ng-content

> **Tempo:** ~18 min · **Slide:** TBD · **Blocco:** G1 Sessione 1 · 10:27–10:45 (ripasso)

---

## Il problema

Il Product Catalog usa Reactive Forms in due punti — **checkout** e **product-form** — con validatori built-in e uno custom. Nel corso avanzato:

- **Mod 2** ripassa rapidamente le form, dando per scontato `FormBuilder` + `Validators` e concentrandosi sui validatori sincroni/asincroni più sofisticati e su `valueChanges` (Observable, vedi [Scheda 02](./02-observable-rxjs.md)).
- **Mod 1** estende la **content projection**: oggi (`<ng-content>` singolo) → multi-slot con `<ng-content select="…">`, e composizione di template con `<ng-template>` + `ngTemplateOutlet`.

Per arrivarci bisogna essere a posto su come si dichiara una form reattiva, come si legano i controlli al template, come si proietta contenuto in un componente contenitore.

---

## Reactive Forms in 4 mosse

### 1. Import del modulo (per componenti standalone)

`ReactiveFormsModule` va negli `imports` del componente che usa la form — non più `appConfig`:

```typescript
// estratto di src/app/pages/checkout/checkout.page.ts
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ReactiveFormsModule], // ← qui
  templateUrl: './checkout.page.html',
})
```

### 2. `FormBuilder` per costruire il `FormGroup`

`FormBuilder` è uno zucchero sintattico per evitare di scrivere `new FormControl(...)` mille volte:

```typescript
// src/app/pages/checkout/checkout.page.ts — codice reale del seme
private fb = inject(FormBuilder);

checkoutForm!: FormGroup;

ngOnInit(): void {
  this.checkoutForm = this.fb.group({
    customerName: ['', Validators.required],
    email:        ['', [Validators.required, Validators.email]],
    address:      ['', [Validators.required, Validators.minLength(10)]],
    notes:        [''],   // opzionale — nessun validatore
  });
}
```

Ogni voce è una tupla `[valoreIniziale, validatori]`. I validatori built-in che vediamo nel seme:

| Validator | Cosa controlla | Errore prodotto |
|---|---|---|
| `Validators.required` | Valore non vuoto | `{ required: true }` |
| `Validators.email` | Stringa formato email | `{ email: true }` |
| `Validators.minLength(n)` | Lunghezza minima | `{ minlength: { requiredLength: n, actualLength } }` |
| `Validators.min(n)` | Numero ≥ n | `{ min: { min: n, actual } }` |

### 3. Binding nel template: `[formGroup]` + `formControlName`

```html
<!-- estratto di src/app/pages/checkout/checkout.page.html -->
<form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
  <label>
    Nome
    <input formControlName="customerName" />
  </label>

  <label>
    Email
    <input type="email" formControlName="email" />
  </label>

  @if (isInvalid('email')) {
    <small class="text-red-600">Email non valida.</small>
  }

  <button type="submit" [disabled]="checkoutForm.invalid">Invia ordine</button>
</form>
```

Tre attributi/direttive:
- `[formGroup]` — collega il `FormGroup` TypeScript al `<form>`.
- `formControlName` — collega il singolo `<input>` a uno dei controlli del gruppo.
- `(ngSubmit)` — emette quando l'utente invia (Enter o `<button type="submit">`).

### 4. Stato dei controlli + messaggi d'errore

Ogni `FormControl` ha tre stati osservabili dal template: `valid`/`invalid`, `touched`/`untouched`, `dirty`/`pristine`. Il pattern del seme è "mostra errore solo se invalido **e** già toccato":

```typescript
// src/app/pages/checkout/checkout.page.ts — codice reale del seme
isInvalid(field: string): boolean {
  const ctrl = this.checkoutForm?.get(field);
  return !!(ctrl?.invalid && ctrl?.touched);
}
```

In `onSubmit` si forza il "touched" su tutti i campi per mostrare gli errori al primo invio:

```typescript
onSubmit(): void {
  if (this.checkoutForm.invalid) {
    this.checkoutForm.markAllAsTouched();   // ← marca tutti come touched
    return;
  }
  // ... costruisci e invia l'ordine
}
```

---

## Validatori custom (factory)

Quando i built-in non bastano, si scrive una **factory function** che ritorna un `ValidatorFn`. Esempio reale dal seme:

```typescript
// src/app/validators/product.validators.ts — codice reale del seme
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function forbiddenWordsValidator(forbidden: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toLowerCase() as string;
    if (!value) return null;                 // lasciamo agire Validators.required

    const found = forbidden.find(word => value.includes(word.toLowerCase()));
    if (!found) return null;                 // valido

    return { forbiddenWord: { word: found } }; // invalido — chiave + payload
  };
}
```

Uso nel form prodotto:

```typescript
// src/app/pages/product-form/product-form.page.ts — codice reale del seme
description: ['', [
  Validators.required,
  Validators.minLength(10),
  forbiddenWordsValidator(['sconto', 'gratis', 'offerta', 'promo']),
]],
```

Convenzione utile da ricordare: l'oggetto restituito (`{ forbiddenWord: {...} }`) usa la **chiave** come "nome dell'errore" — il template la rilegge con `control.hasError('forbiddenWord')` e accede al payload con `control.getError('forbiddenWord').word`.

> **Mod 2** estenderà questo pattern con:
> - validatori **asincroni** che ritornano `Observable<ValidationErrors | null>` (es. check unicità username via HTTP);
> - cross-field validation (validatore applicato a livello di `FormGroup`).

---

## ng-content: proiettare contenuto

`ng-content` permette a un componente contenitore di accettare contenuto arbitrario dall'esterno. Il seme ce l'ha sulla `CardContainer`:

```typescript
// src/app/components/card-container/card-container.ts — codice reale del seme
@Component({
  selector: 'app-card-container',
  imports: [],
  templateUrl: './card-container.html',
})
export class CardContainer {
  @Input() title: string = '';
  @Input() variant: 'default' | 'success' | 'warning' | 'info' = 'default';
}
```

```html
<!-- src/app/components/card-container/card-container.html — codice reale del seme -->
<div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

  @if (title) {
    <div [class]="'px-4 py-3 ' + headerClass">
      <h3 class="font-semibold text-sm">{{ title }}</h3>
    </div>
  }

  <div class="p-4">
    <ng-content></ng-content>     <!-- ← qui finisce il contenuto del padre -->
  </div>

</div>
```

Uso dal padre (estratto da `HomePage`):

```html
<app-card-container title="Catalogo prodotti" variant="info">
  <!-- tutto questo finisce dentro al <ng-content> della card -->
  @for (p of filteredProducts; track p.id) {
    <app-product-card [product]="p" (addToCart)="onAddToCart(p)" />
  }
</app-card-container>
```

In sintesi: **`<ng-content>` è un foro** nel template del figlio dove il padre infila ciò che vuole. Funziona con qualsiasi contenuto HTML/componenti — nessun setup particolare nel `@Component`.

---

## Dove l'avanzato lo estende (Mod 1)

| Tecnica | Cosa aggiunge | Sintassi |
|---|---|---|
| **Projection multi-slot** | Più "fori" nello stesso componente, ciascuno con un selettore | `<ng-content select="[header]">` + `<ng-content select="[body]">` |
| **`<ng-template>`** | Definisce un frammento di template **non renderizzato** finché qualcuno non lo monta | `<ng-template #blocco>...</ng-template>` |
| **`ngTemplateOutlet`** | Monta un `<ng-template>` in un punto preciso, eventualmente passandogli un contesto | `<ng-container *ngTemplateOutlet="blocco; context: {...}">` |

Esempio M1 di anteprima — non da scrivere oggi:

```html
<!-- card avanzata con tre slot -->
<app-fancy-card>
  <div header>Catalogo prodotti</div>
  <div body>[contenuto principale]</div>
  <div footer>Pagina 1 di 5</div>
</app-fancy-card>
```

---

## Errori comuni

### 1. Dimenticare `ReactiveFormsModule` negli `imports`

```typescript
// ❌ standalone component senza ReactiveFormsModule → "Can't bind to 'formGroup' since it isn't a known property of 'form'"
@Component({ imports: [], ... })
```
Aggiungilo: `imports: [ReactiveFormsModule]`. Nel seme è importato in `CheckoutPage` e `ProductFormPage`.

### 2. Mostrare l'errore senza `touched`

```html
<!-- ❌ Mostra l'errore appena la pagina si apre, prima ancora che l'utente abbia tipato qualcosa -->
@if (form.get('email')?.invalid) {
  <small>Email obbligatoria.</small>
}

<!-- ✅ Aspetta che il controllo sia stato "toccato" -->
@if (isInvalid('email')) { <small>Email obbligatoria.</small> }
```

### 3. Resettare la form senza valori di default

```typescript
// ❌ reset() svuota tutto → in product-form perderemmo available=true
this.productForm.reset();

// ✅ reset(value) ripristina i default
this.productForm.reset({ available: true });
```

### 4. Confondere `<ng-content>` con `<ng-template>`

`<ng-content>` si renderizza **sempre** (a parte i selettori); `<ng-template>` **non si renderizza** finché qualcuno non lo monta. Sono complementari: la card del seme usa solo `<ng-content>`, in Mod 1 li userai insieme.

---

## Schema riassuntivo

```
Reactive Forms                                  ng-content
──────────────                                  ──────────
@Component({ imports: [ReactiveFormsModule] })   <app-card-container>
                                                   <p>Contenuto del padre</p>
private fb = inject(FormBuilder);                </app-card-container>
this.form = this.fb.group({                                │
  email: ['', [Validators.required, …]]                    │ proiettato
});                                                        ▼
                                                 ┌──────────────────┐
<form [formGroup]="form" (ngSubmit)="onSubmit()">│ <ng-content/>    │
  <input formControlName="email" />              └──────────────────┘
</form>                                          (figlio: CardContainer)
   │
   ├── form.valid / form.invalid
   ├── controllo.touched / pristine
   └── form.markAllAsTouched()
```

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/pages/checkout/checkout.page.ts`](../../progetto/product-catalog/src/app/pages/checkout/checkout.page.ts) | `FormBuilder.group(...)` con `Validators.required/email/minLength` + `markAllAsTouched` + `onSubmit` |
| [`src/app/pages/product-form/product-form.page.ts`](../../progetto/product-catalog/src/app/pages/product-form/product-form.page.ts) | Stessa struttura + `forbiddenWordsValidator` agganciato + `getFieldError` per messaggi mirati |
| [`src/app/validators/product.validators.ts`](../../progetto/product-catalog/src/app/validators/product.validators.ts) | Factory di un `ValidatorFn` con payload nell'errore |
| [`src/app/components/card-container/card-container.ts`](../../progetto/product-catalog/src/app/components/card-container/card-container.ts) + [`card-container.html`](../../progetto/product-catalog/src/app/components/card-container/card-container.html) | `<ng-content>` slot singolo |

---

## Prossimo: [Lab 0 — Setup + mini-esercizio](../lab-00/README.md)
