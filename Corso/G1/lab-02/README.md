# Lab 2 — NotificationService (BehaviorSubject) + Carousel Splide
### Giorno 1 · Lab guidato (35 min)

---

## Obiettivo

Applicare i due pattern della Scheda 10 in un esercizio compatto:

1. **`NotificationService`** — un servizio singleton che pubblica una lista di toast tramite `BehaviorSubject<Notification[]>`, esposta come `Observable` ai consumer.
2. **`Toast`** — un componente standalone che consuma `notifications$` con `takeUntilDestroyed` e mostra i messaggi attivi.
3. **`Carousel`** — un componente standalone che wrappa Splide.js (vanilla JS) usando `NgZone.runOutsideAngular` per evitare di intasare il change detection, con cleanup garantito.

Risultato visivo: in alto, sotto all'header, scorre un carousel di slide promozionali; in basso a destra appare uno stack di toast quando aggiungi un prodotto al carrello.

---

## File creati / modificati

| File | Ruolo | Stato |
|---|---|---|
| `src/app/services/notification.service.ts` | Servizio toast con `BehaviorSubject` | **nuovo** |
| `src/app/components/toast/toast.ts` + `.html` | Consumer dei toast | **nuovo** |
| `src/app/components/carousel/carousel.ts` + `.html` | Wrapper Splide | **nuovo** |
| `src/app/app.html` | Aggiunto `<app-toast />` come "root" dei toast | modificato |
| `src/app/pages/home/home.page.html` | Aggiunto `<app-carousel [slides]="..." />` sopra alla griglia | modificato |
| `package.json` | Aggiunta dipendenza `@splidejs/splide` | dipendenza |

---

## Setup — installa Splide (5 min)

Solo per il progetto di verifica `product-catalog-finale/` (il seme resta intatto):

```bash
cd Corso/progetto/product-catalog-finale
npm install @splidejs/splide
```

> Splide.js è una libreria carousel vanilla JS (~25 kB, zero dipendenze). La useremo come esempio "libreria che lavora sul DOM e si gestisce da sola" per mostrare il pattern `NgZone.runOutsideAngular`.

---

## Parte 1 — NotificationService + Toast (~15 min)

### TODO 1 — FACILE: servizio con BehaviorSubject

Crea `src/app/services/notification.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // Stato interno: lista dei toast attivi.
  // private + asObservable() → i consumer non possono fare next() dall'esterno.
  private list$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  readonly notifications$: Observable<Notification[]> = this.list$.asObservable();

  success(message: string): void { this.push('success', message); }
  error(message: string)   : void { this.push('error',   message); }
  info(message: string)    : void { this.push('info',    message); }

  dismiss(id: number): void {
    this.list$.next(this.list$.value.filter(n => n.id !== id));
  }

  private push(type: Notification['type'], message: string): void {
    const n: Notification = { id: this.nextId++, type, message };
    this.list$.next([...this.list$.value, n]);    // ✅ sempre nuovo array
  }
}
```

Punti chiave:
- `private list$` + `readonly notifications$ = list$.asObservable()` = **incapsulamento**: nessuno fuori può fare `next()`.
- `[...list$.value, n]` produce sempre un nuovo riferimento → i subscriber rilevano il cambiamento.

### TODO 2 — MEDIO: componente Toast

Crea `src/app/components/toast/toast.ts`:

```typescript
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
})
export class Toast {
  private notifications = inject(NotificationService);
  private destroyRef    = inject(DestroyRef);

  // Signal locale alimentato dall'Observable del servizio
  readonly list = signal<Notification[]>([]);

  constructor() {
    // Inizializzatore di proprietà / constructor sono injection context →
    // takeUntilDestroyed() senza argomento funziona, ma essere espliciti aiuta la lettura.
    this.notifications.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(list => this.list.set(list));
  }

  dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
```

E il template `toast.html`:

```html
<div class="fixed top-4 right-4 flex flex-col gap-2 z-30 max-w-xs">
  @for (n of list(); track n.id) {
    <div [class]="'rounded-lg shadow-lg px-4 py-3 text-sm border ' +
      (n.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
       n.type === 'error'   ? 'bg-red-50 border-red-200 text-red-800' :
                              'bg-blue-50 border-blue-200 text-blue-800')">
      <div class="flex justify-between items-start gap-3">
        <span>{{ n.message }}</span>
        <button (click)="dismiss(n.id)" class="opacity-60 hover:opacity-100">✕</button>
      </div>
    </div>
  }
</div>
```

### TODO 3 — FACILE: mount in app.html

Apri `src/app/app.html` e, **prima** del `</div>` finale, aggiungi:

```html
<app-toast />
```

Poi in `src/app/app.ts` aggiungi `Toast` agli `imports`:

```typescript
import { Toast } from './components/toast/toast';

@Component({
  // ...
  imports: [RouterOutlet, Header, Footer, LiveTimer, Toast],
})
```

> **Test rapido**: apri la home, aggiungi un prodotto al carrello, poi modifica temporaneamente `ProductService.addToCart` per chiamare `inject(NotificationService).success('Aggiunto al carrello')` — vedrai apparire il toast.
> (Questa modifica al `ProductService` non è richiesta dal lab: è solo per vedere il toast funzionare. Puoi anche istanziare il servizio dalla console del browser per testarlo.)

---

## Parte 2 — Carousel Splide (~15 min)

### TODO 4 — MEDIO: componente Carousel

Crea `src/app/components/carousel/carousel.ts`:

```typescript
import {
  Component, ElementRef, NgZone, DestroyRef, inject,
  afterNextRender, input, viewChild,
} from '@angular/core';
import Splide from '@splidejs/splide';
import '@splidejs/splide/css';   // import degli stili Splide

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.html',
})
export class Carousel {
  // Signal input — array di stringhe (testo da mostrare nelle slide)
  slides = input.required<string[]>();

  private zone       = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  // Reference al <section> nel template
  private host = viewChild.required<ElementRef<HTMLElement>>('host');

  private splide?: Splide;

  constructor() {
    // afterNextRender: garantisce DOM montato; SSR-safe (importante per Mod 6)
    afterNextRender(() => {
      // ✅ Tutta la mount fuori zone: animazioni e drag non scatenano CD
      this.zone.runOutsideAngular(() => {
        this.splide = new Splide(this.host().nativeElement, {
          type: 'loop',
          perPage: 1,
          autoplay: true,
          interval: 3000,
        });
        this.splide.mount();
      });
    });

    // ✅ Cleanup garantito
    this.destroyRef.onDestroy(() => this.splide?.destroy());
  }
}
```

E il template `carousel.html` (la struttura HTML è quella richiesta da Splide):

```html
<section #host class="splide" aria-label="Promozioni">
  <div class="splide__track">
    <ul class="splide__list">
      @for (s of slides(); track s) {
        <li class="splide__slide bg-teal-50 text-teal-800 text-center py-6 font-semibold">
          {{ s }}
        </li>
      }
    </ul>
  </div>
</section>
```

### TODO 5 — FACILE: mount in home.page.html

Apri `src/app/pages/home/home.page.html` e **sopra** alla riga del filtro (l'`<input type="text" [(ngModel)]="searchTerm" ...>`) inserisci il carousel:

```html
<app-carousel
  [slides]="['🚀 Spedizione gratuita oltre 50€', '🎁 Reso entro 30 giorni', '🛡️ Garanzia 2 anni']"
  class="block mb-6" />
```

Poi in `src/app/pages/home/home.page.ts` aggiungi `Carousel` agli `imports`:

```typescript
import { Carousel } from '../../components/carousel/carousel';

@Component({
  // ...
  imports: [CommonModule, FormsModule, FilterProductsPipe, CartSummary, ProductCard, CardContainer, Carousel],
})
```

> A questo punto la home mostra il carousel con autoplay ogni 3 secondi. **Apri il profiler**: niente change detection scatenato dai tick di Splide. Confronta con la stessa app **senza** `runOutsideAngular` — vedrai un picco di chiamate di CD ogni 16 ms.

---

## TODO 6 — DIFFICILE (opzionale, ~5 min): auto-dismiss dei toast

I toast restano a video per sempre finché l'utente non clicca ✕. Più realistico: spariscono dopo N secondi. Senza intasare la zone.

In `NotificationService.push`, dopo il `next()`:

```typescript
private push(type: Notification['type'], message: string, ttlMs = 4000): void {
  const n: Notification = { id: this.nextId++, type, message };
  this.list$.next([...this.list$.value, n]);

  // Auto-dismiss FUORI zone, rientriamo in zone solo per modificare lo state
  this.zone.runOutsideAngular(() => {
    setTimeout(() => this.zone.run(() => this.dismiss(n.id)), ttlMs);
  });
}
```

Per usarlo serve `inject(NgZone)` nel servizio. Bonus: aggiungi un parametro `ttlMs?: number` ai metodi pubblici (`success(msg, ttl?)` ecc.) per permettere durate diverse.

---

## Criteri di verifica

- [ ] Il carousel parte all'avvio della home, autoplay ogni 3 secondi.
- [ ] Niente errori console (`Cannot read properties of undefined` su `host.nativeElement` = init prima della view).
- [ ] Aggiungere un prodotto al carrello (eventualmente con un `inject(NotificationService).success(...)` temporaneo nel `ProductService`) fa apparire il toast in alto a destra.
- [ ] Cliccando ✕ sul toast, sparisce subito; gli altri restano.
- [ ] Navigando via dalla home e tornando, il carousel si re-istanzia senza errori (no leak di istanze precedenti — Angular distrugge il vecchio `Carousel` → `splide?.destroy()` parte).
- [ ] **Verifica formale (binario A):** applicando la `solution/` a `product-catalog-finale/` (dopo `npm install @splidejs/splide`), `npx ng build` + `npx ng test` passano.

---

## Se ti blocchi

| Sintomo | Probabile causa | Dove guardare |
|---|---|---|
| `Cannot find module '@splidejs/splide'` | Manca `npm install @splidejs/splide` | Setup |
| Splide misura 0 px o sbagliato | Init in `ngOnInit` invece di `afterNextRender` | TODO 4 |
| L'app scatta in CD continuo (60 FPS sprecati) | Manca `runOutsideAngular` attorno a `splide.mount()` | TODO 4 |
| `splide.destroy is not a function` quando navighi via | Hai dimenticato di salvare `this.splide = …` dentro al callback di `runOutsideAngular`, oppure manca `destroyRef.onDestroy` | TODO 4 |
| Toast non appare quando il servizio fa `success(...)` | Manca `<app-toast />` in `app.html` o `Toast` negli `imports` di `App` | TODO 3 |
| Memory leak (Toast resta sub-scritto dopo navigate) | Manca `takeUntilDestroyed(this.destroyRef)` nel `pipe()` | TODO 2 |
| Toast appare ma non sparisce mai (con TODO 6) | `setTimeout` chiamato dentro a `zone.run` invece che fuori | TODO 6 |

Soluzione completa in `solution/` — aprila solo dopo aver tentato!
