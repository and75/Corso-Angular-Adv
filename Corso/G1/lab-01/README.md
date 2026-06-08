# Lab 1 — ProductCard multi-slot + ProductQuickView dinamico
### Giorno 1 · Lab guidato (60 min)

---

## Obiettivo

Mettere in pratica i pattern delle schede 06–08:
1. Refactorare la `ProductCard` con **projection multi-slot** (`[badge]` + `[footer]`), così che l'host possa personalizzare due aree senza riscrivere la card.
2. Creare un nuovo componente `ProductQuickView` standalone e mostrarlo a richiesta usando l'**istanziazione dinamica** con `ViewContainerRef.createComponent`.

Al termine, nella griglia della home, ogni card mostra il proprio badge categoria + un pulsante "Anteprima"; cliccando il pulsante, una preview sovrapposta appare montata dinamicamente sotto la griglia.

---

## File modificati / creati in questo lab

| File | Ruolo | Stato |
|---|---|---|
| `src/app/components/product-card/product-card.ts` | Aggiunge `@if` per fallback badge e mantiene signal input | modificato |
| `src/app/components/product-card/product-card.html` | Aggiunge `<ng-content select="[badge]">` + `<ng-content select="[footer]">` | modificato |
| `src/app/components/product-quick-view/product-quick-view.ts` | Nuovo componente standalone con `product` input + `close` output | **nuovo** |
| `src/app/components/product-quick-view/product-quick-view.html` | Template della preview | **nuovo** |
| `src/app/pages/home/home.page.ts` | Aggiunge `quickAnchor` (viewChild ViewContainerRef) + `openQuickView` | modificato |
| `src/app/pages/home/home.page.html` | Inserisce `[badge]` + `[footer]` con il bottone "Anteprima" + `<ng-container #quickViewAnchor>` | modificato |

> Il resto del progetto è invariato.

---

## Setup veloce

Se non hai già `ng serve` + `json-server` attivi (dal Lab 0):

```bash
# Shell 1
cd Corso/progetto/product-catalog
npx json-server --watch db.json --port 3000

# Shell 2
cd Corso/progetto/product-catalog
ng serve
```

Apri `http://localhost:4200` → home con i prodotti.

---

## Parte 1 — ProductCard multi-slot (~25 min)

Apri `src/app/components/product-card/product-card.html`. Oggi il badge della categoria è hard-coded nel template della card:

```html
<span class="text-xs ... rounded-full">
  {{ product().category }}
</span>
```

Vogliamo che la card **proietti** un badge fornito dall'host. Se l'host non passa nulla, la card mostra il badge categoria come default. In più, aggiungiamo uno slot `[footer]` libero, dove l'host può infilare azioni extra (es. il pulsante "Anteprima" della Parte 2).

### TODO 1 — FACILE: badge slot con fallback

Nel template della card sostituisci lo `<span>` della categoria con un `<ng-content select="[badge]">` che ha come **fallback** lo stesso `<span>`:

```html
<ng-content select="[badge]">
  <!-- fallback default: il badge categoria che era qui prima -->
  <span class="text-xs font-medium bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
    {{ product().category }}
  </span>
</ng-content>
```

### TODO 2 — FACILE: footer slot

Dopo la riga del prezzo + pulsante "Aggiungi", aggiungi uno slot footer "vuoto di default":

```html
<div class="mt-2">
  <ng-content select="[footer]"></ng-content>
</div>
```

> Nessuna modifica a `product-card.ts` per ora: la classe non sa nulla degli slot — è il template che li espone.

### TODO 3 — FACILE: usare gli slot da HomePage

Apri `src/app/pages/home/home.page.html`. Dentro al ciclo `@for`, l'`<app-product-card>` oggi è auto-chiuso (`<app-product-card ... />`). Trasformalo in tag aperto/chiuso e passa due nodi proiettati:

```html
<app-product-card [product]="product" (addToCart)="onAddToCart($event)">
  <!-- badge personalizzato (override del default categoria) -->
  @if (product.price > 1000) {
    <span badge class="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
      🌟 Premium
    </span>
  }

  <!-- footer: pulsante "Anteprima" che useremo nella Parte 2 -->
  <button footer
          (click)="openQuickView(product); $event.stopPropagation()"
          class="w-full text-xs border border-teal-600 text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
    Anteprima
  </button>
</app-product-card>
```

Cose da notare:
- I prodotti con prezzo > 1000 ricevono un badge "Premium" custom; gli altri **mostrano il fallback** (badge categoria) perché non passano nessun `[badge]`.
- Il pulsante "Anteprima" è il consumer dello slot `[footer]`. La card non sa niente di lui — perfetto disaccoppiamento.
- `$event.stopPropagation()` evita che il click navighi al dettaglio (la card stessa è cliccabile).

> **A questo punto** `ng serve` ti mostra i badge Premium dove il prezzo lo richiede, e i pulsanti "Anteprima" sotto a ogni card. Il pulsante non fa ancora nulla — `openQuickView` la implementiamo nella Parte 2.

---

## Parte 2 — ProductQuickView dinamico (~30 min)

### TODO 4 — MEDIO: creare il componente ProductQuickView

Crea i due file:
- `src/app/components/product-quick-view/product-quick-view.ts`
- `src/app/components/product-quick-view/product-quick-view.html`

Il componente è **standalone** (requisito per `createComponent`), riceve un `product` come signal input e emette `close` come signal output.

```typescript
// product-quick-view.ts
import { Component, input, output, computed } from '@angular/core';
import { Product } from '../../product.model';

@Component({
  selector: 'app-product-quick-view',
  standalone: true,
  templateUrl: './product-quick-view.html',
})
export class ProductQuickView {
  product = input.required<Product>();
  close = output<void>();

  formattedPrice = computed(() =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
      .format(this.product().price)
  );
}
```

```html
<!-- product-quick-view.html -->
<aside class="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-xl border p-4 z-20">
  <header class="flex justify-between items-start mb-2">
    <h3 class="font-bold text-teal-700">{{ product().name }}</h3>
    <button (click)="close.emit()" class="text-gray-400 hover:text-gray-700">✕</button>
  </header>
  <p class="text-sm text-gray-600 mb-2">{{ product().description }}</p>
  <p class="text-lg font-bold text-teal-700">{{ formattedPrice() }}</p>
  <p class="text-xs text-gray-500 mt-1">Categoria: {{ product().category }}</p>
</aside>
```

### TODO 5 — MEDIO: anchor + viewChild in HomePage

Apri `src/app/pages/home/home.page.html` e, **alla fine** del template (fuori dal `@for`), aggiungi l'ancora:

```html
<ng-container #quickViewAnchor></ng-container>
```

In `src/app/pages/home/home.page.ts` ottieni il `ViewContainerRef`:

```typescript
// in cima al file, fra gli altri import:
import { ViewContainerRef, viewChild, ComponentRef } from '@angular/core';
import { ProductQuickView } from '../../components/product-quick-view/product-quick-view';

export class HomePage {
  // ... codice esistente ...

  // ✅ TODO 5: signal che punta al ViewContainerRef dell'ancora
  private quickAnchor = viewChild('quickViewAnchor', { read: ViewContainerRef });
  private currentQuickView?: ComponentRef<ProductQuickView>;
}
```

### TODO 6 — MEDIO: implementare openQuickView()

Sempre in `home.page.ts`, aggiungi:

```typescript
openQuickView(p: Product): void {
  const vcr = this.quickAnchor();
  if (!vcr) return;            // viewChild ancora undefined al primo CD: safe-guard

  // ✅ Pulizia preventiva: niente accumulo se l'utente clicca più volte
  vcr.clear();

  // ✅ Crea il componente dinamicamente
  const ref = vcr.createComponent(ProductQuickView);
  ref.setInput('product', p);

  // ✅ Cleanup quando la quick-view si auto-chiude
  ref.instance.close.subscribe(() => vcr.clear());

  this.currentQuickView = ref;
}
```

> A questo punto cliccando "Anteprima" su una card vedi la preview in basso a destra. Cliccando "×" sparisce. Cliccando su una seconda card mentre una preview è aperta, la precedente sparisce e quella nuova prende il suo posto (grazie a `vcr.clear()` preventivo).

### TODO 7 — DIFFICILE (opzionale): cleanup esplicito su distruzione

Cosa succede se l'utente naviga via dalla home con una quick-view aperta? Il componente padre viene distrutto, il `ViewContainerRef` con lui, e Angular pulisce tutto in cascata. Ma se vuoi essere **esplicito** (good practice), aggiungi:

```typescript
import { DestroyRef } from '@angular/core';

export class HomePage {
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.currentQuickView?.destroy();
    });
  }
}
```

In Angular questo è ridondante (lo farebbe da solo) ma in code review è una buona abitudine: rende esplicito che ti ricordi del cleanup. Decidi tu se aggiungerlo.

---

## Criteri di verifica

- [ ] La card mostra il badge "Premium" sui prodotti > 1000 € e il badge categoria sugli altri (verifica visiva sulla home).
- [ ] Tutte le card hanno il pulsante "Anteprima" sotto al pulsante "Aggiungi".
- [ ] Cliccando "Anteprima" appare la preview in basso a destra con i dati del prodotto giusto.
- [ ] Cliccando "×" sulla preview, sparisce.
- [ ] Cliccando "Anteprima" su un secondo prodotto, la preview cambia prodotto (non se ne accumulano due).
- [ ] Cliccando una card (non i pulsanti) si naviga al dettaglio del prodotto — la propagazione del click "Anteprima" è correttamente fermata.
- [ ] `ng serve` non lancia errori, console del browser pulita.
- [ ] **Verifica formale (binario A):** applicando la `solution/` a `Corso/progetto/product-catalog-finale/` ed eseguendo `npx ng build` + `npx ng test`, tutto passa.

---

## Se ti blocchi

| Sintomo | Probabile causa | Dove guardare |
|---|---|---|
| `Can't bind to 'ngTemplateOutlet' since it isn't a known property` | Non applicabile in questo lab (non usiamo ngTemplateOutlet) — controlla di non aver introdotto `*ngTemplateOutlet` per errore | nessun file |
| Il badge `[badge]` non sovrascrive mai il default | Il selettore `[badge]` cerca l'**attributo** `badge`. Hai scritto `<span class="badge">`? Cambialo in `<span badge ...>` | TODO 3 |
| `Error: NG3001` o `createComponent: not standalone` | `ProductQuickView` non ha `standalone: true` | TODO 4 |
| `Cannot read properties of undefined (reading 'createComponent')` | `viewChild` ancora `undefined`. Hai chiamato `openQuickView` da `ngOnInit`? Va chiamato da un evento utente. | TODO 5/6 |
| Cliccando "Anteprima" si apre anche il dettaglio del prodotto | Manca `$event.stopPropagation()` sul `(click)` del bottone footer | TODO 3 |
| Le preview si accumulano | Manca `vcr.clear()` prima di `createComponent` | TODO 6 |

Soluzione completa in `solution/` — aprila solo dopo aver tentato!
