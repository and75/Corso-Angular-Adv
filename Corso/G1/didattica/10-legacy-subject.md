# 10 — Libreria legacy + NgZone · Subject / BehaviorSubject

> **Tempo:** ~30 min (Parte A ~15' + Parte B ~15') · **Slide:** TBD · **Blocco:** G1 Sessione 5 · 15:45–16:15 (Mod 1c + 1d)

---

## Il problema

Due dei pattern più ricorrenti nei progetti reali non rientrano nel "puro mondo Angular":

- **Parte A — Libreria legacy + NgZone:** integrare una libreria JavaScript "vanilla"
  (un carousel, un grafico, un editor, una mappa) che lavora sul DOM e si manda avanti
  da sola con `requestAnimationFrame` o event-listener nativi. Se la si lascia "libera"
  dentro a Angular, Zone.js scatena il change detection a ogni tick e l'app rallenta.
- **Parte B — Subject / BehaviorSubject:** comunicare tra componenti che non si
  conoscono (un servizio che notifica un toast, un bus di eventi, un wrapper di una
  libreria che vuole spingere update). I `signal` del seme (`services/product.ts` per
  il carrello) gestiscono benissimo *stato locale*; per gli *eventi* spesso serve un
  altro strumento.

Entrambi atterrano nel **Lab 2**: avvolgeremo Splide.js (Parte A) e costruiremo un
`NotificationService` con BehaviorSubject (Parte B).

---

# Parte A — Libreria legacy + NgZone (~15 min)

## Il principio dello zone

Zone.js intercetta tutti gli eventi async e dice ad Angular "ok, controlla se devi
ridipingere lo schermo". Se la libreria fa `requestAnimationFrame` 60 volte al secondo
o ascolta `mousemove`, ogni callback diventa un giro di change detection. Per UI
intensive (carousel, scroll-listener, animazioni canvas) è il modo più veloce per
piantare la pagina.

`NgZone` ci dà due bottoni:

| Metodo | Cosa fa |
|---|---|
| `runOutsideAngular(fn)` | esegue `fn` **fuori** dalla zone → niente CD dopo ogni microtask |
| `run(fn)` | rientra dentro la zone → utile per propagare un cambiamento allo state Angular |

---

## Pattern del wrapper (modello)

Lo schema che useremo nel Lab 2 con Splide vale per qualsiasi libreria DOM legacy.

```typescript
// estratto del componente Carousel del Lab 2
import {
  Component, ElementRef, NgZone, DestroyRef, inject,
  afterNextRender, viewChild,
} from '@angular/core';
import Splide from '@splidejs/splide';

@Component({
  selector: 'app-carousel',
  standalone: true,
  template: `
    <section #host class="splide">
      <div class="splide__track">
        <ul class="splide__list">
          @for (s of slides; track s) {
            <li class="splide__slide">{{ s }}</li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class Carousel {
  // ─── DI ─────────────────────────────────────────────────────────────────
  private zone       = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  private host = viewChild<ElementRef<HTMLElement>>('host');

  slides = ['A', 'B', 'C', 'D'];
  private splide?: Splide;

  constructor() {
    // afterNextRender: garantisce che la view sia montata. È un hook SSR-safe
    // (non parte sul server) — utile in Mod 6.
    afterNextRender(() => {
      const el = this.host()?.nativeElement;
      if (!el) return;

      // ✅ Tutta l'inizializzazione di Splide è fuori dalla zone:
      //    i suoi event-listener e i suoi animation loop non scateneranno CD.
      this.zone.runOutsideAngular(() => {
        this.splide = new Splide(el, { type: 'loop', perPage: 1 });
        this.splide.mount();
      });
    });

    // ✅ Cleanup garantito a destroy del componente
    this.destroyRef.onDestroy(() => this.splide?.destroy());
  }
}
```

Tre punti da memorizzare:

1. **`afterNextRender`** è il successore moderno di `ngAfterViewInit` per "inizializza
   dopo il primo render". È SSR-safe: sul server non viene chiamato.
2. **Tutta la mount** della libreria sta dentro a `runOutsideAngular`. Da quel momento
   Splide gira fuori zone: animazioni e drag non triggherano CD inutile.
3. **`destroyRef.onDestroy`** prende il posto del classico `ngOnDestroy`. Più leggibile,
   meno boilerplate, niente metodo "fantasma" sulla classe.

---

## Rientrare in zone quando serve

Se la libreria ha un callback (`onSlideChange`, `onClick`, …) che deve aggiornare un
`signal` o un `BehaviorSubject` di Angular, **dobbiamo rientrare** con `zone.run`:

```typescript
this.zone.runOutsideAngular(() => {
  this.splide!.on('move', (newIndex: number) => {
    // ⚠️ siamo ancora fuori zone — un signal.set() qui non scatena CD
    this.zone.run(() => {
      this.currentIndex.set(newIndex);   // ✅ dentro zone → la UI si aggiorna
    });
  });
});
```

> **Regola pratica:** la *registrazione* dei listener fuori zone; *il payload che
> tocca state Angular* dentro zone con `zone.run`.

---

## Errori comuni — Parte A

### A.1 Inizializzare in `ngOnInit`

```typescript
ngOnInit() {
  this.splide = new Splide(this.host()!.nativeElement, {...}).mount();  // ❌
}
```

`ngOnInit` parte prima che la view sia completamente costruita: l'elemento può non
esistere ancora o non avere dimensioni. Sintomo: Splide misura `width = 0` e impagina
male. Fix: `afterNextRender` (preferito) o `ngAfterViewInit`.

### A.2 Dimenticare `runOutsideAngular`

L'app sembra "lenta" appena scrolli o trascini la slide. Profilando: il CD parte
ogni 16 ms. Fix: incapsulare l'init e tutti i listener della libreria in
`runOutsideAngular`.

### A.3 Niente `destroy()`

Se il componente viene smontato e rimontato, le istanze precedenti restano legate al
DOM via internals della libreria. Memory leak silenzioso. Fix: `destroyRef.onDestroy`
con `this.splide?.destroy()`.

### A.4 `zone.run` su tutta la callback

```typescript
this.splide!.on('move', (i) => this.zone.run(() => { /* tutto */ }));
```

Funziona, ma riprende la zone per **tutta** la callback (incluso il codice della
libreria che riprende dal callback). Spesso si paga di nuovo il costo di prima.
**Fix:** chiamare `zone.run` solo intorno al `signal.set()` (o all'emit del
BehaviorSubject), come nel pattern sopra.

---

# Parte B — Subject / BehaviorSubject (~15 min)

> **Prerequisito:** ripasso Observable e operatori → [Scheda 02 — Observable e RxJS Base](./02-observable-rxjs.md).

## Subject = bus eventi puro

Un `Subject<T>` è **sia** un Observable **sia** un Observer: chi lo "tiene in mano"
può fare `subject.next(value)` per emettere; chi ci si sottoscrive lo riceve come un
normale Observable.

```typescript
import { Subject } from 'rxjs';

const click$ = new Subject<MouseEvent>();
click$.subscribe(ev => console.log('A', ev.clientX));
click$.subscribe(ev => console.log('B', ev.clientX));

click$.next(new MouseEvent('click'));   // A e B ricevono entrambi
```

Tre proprietà che lo rendono utile:

- **Multicast:** tutti i subscriber attivi ricevono lo stesso evento (a differenza di
  un Observable freddo che parte da capo per ogni `.subscribe()`).
- **Push-based:** chi *possiede* il Subject decide quando emettere.
- **Niente valore storico:** chi si sottoscrive **dopo** un `next` non riceve nulla
  finché non arriva il prossimo.

L'ultimo punto è il limite: per il pattern "stato condiviso" (lista toast, utente
loggato, theme corrente) ti serve **l'ultimo valore replicato** ai nuovi subscriber.
Lì entra in scena BehaviorSubject.

---

## BehaviorSubject = Subject con stato corrente

```typescript
import { BehaviorSubject } from 'rxjs';

const cartCount$ = new BehaviorSubject<number>(0);   // ← initial value obbligatorio

cartCount$.subscribe(n => console.log('A', n));   // A: 0
cartCount$.next(3);                                // A: 3
cartCount$.subscribe(n => console.log('B', n));   // B: 3 ← l'ultimo valore!
cartCount$.next(4);                                // A: 4, B: 4
```

Tre differenze pratiche con `Subject`:

| Aspetto | `Subject` | `BehaviorSubject` |
|---|---|---|
| Valore iniziale | non c'è | obbligatorio |
| Late subscriber riceve l'ultimo valore | no | sì |
| Accesso sincrono al valore corrente | no | `subject.getValue()` o `.value` |

`BehaviorSubject` è "uno stato che gli osservatori vedono come uno stream".

---

## Pattern del NotificationService (modello)

Lo schema che useremo nel Lab 2:

```typescript
// services/notification.service.ts — anteprima Lab 2
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // ✅ stato interno: array dei toast attivi
  private list$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  // ✅ esposizione **read-only** — i consumer non possono emettere
  readonly notifications$: Observable<Notification[]> = this.list$.asObservable();

  success(message: string): void { this.push('success', message); }
  error(message: string)   : void { this.push('error',   message); }

  dismiss(id: number): void {
    this.list$.next(this.list$.value.filter(n => n.id !== id));
  }

  private push(type: Notification['type'], message: string) {
    const n: Notification = { id: this.nextId++, type, message };
    this.list$.next([...this.list$.value, n]);
  }
}
```

Due cose chiave:

- **`asObservable()`** restituisce un `Observable<T>` "downcasted" del Subject: chi
  riceve `notifications$` può sottoscriversi ma **non** può fare `next` (l'API non gli
  espone il metodo). Incapsulamento dello stato.
- **`list$.value`** fornisce l'accesso sincrono per calcolare il prossimo state
  (filtri/append) senza dover sottoscriversi una tantum.

---

## Cancellare la sottoscrizione: `takeUntilDestroyed`

Le sottoscrizioni a `Subject`/`BehaviorSubject` **non terminano da sole** (a
differenza di una `HttpClient.get()` che emette un valore e completa). Se il
componente viene distrutto senza unsubscribe, il callback continua a girare in
memoria.

In Angular 16+ il modo idiomatico è `takeUntilDestroyed` da `@angular/core/rxjs-interop`:

```typescript
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `…`,
})
export class Toast {
  private notifications = inject(NotificationService);
  private destroyRef    = inject(DestroyRef);

  ngOnInit(): void {
    this.notifications.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))   // ✅ auto-unsubscribe
      .subscribe(list => this.list = list);
  }

  list: import('../../services/notification.service').Notification[] = [];
}
```

Due note pratiche:

- `takeUntilDestroyed()` senza argomento funziona **solo dentro a un injection
  context** (es. inizializzatore di proprietà o `constructor`). Fuori da lì — come
  dentro `ngOnInit` — va passato esplicitamente `this.destroyRef`.
- In alternativa puoi inizializzare l'observable come **proprietà** della classe:
  ```typescript
  list$ = this.notifications.notifications$.pipe(takeUntilDestroyed());
  ```
  e nel template usare `@if/@for` su `list$ | async`. Più rxjs-style, meno
  `subscribe()` manuali.

---

## Subject/BehaviorSubject vs signal — quando uso cosa?

Il seme già fa `signal`/`computed` nel `ProductService`. È giusto, ma non è la stessa
cosa. Regola pratica del corso:

| Caso | Strumento |
|---|---|
| **Stato di un componente** consumato dal template di quel componente | `signal` (Angular 17+) |
| **Stato derivato** da altri signal | `computed` |
| **Effetto collaterale** quando uno stato cambia | `effect` |
| **Bus di eventi** (toast, click globali, "user logged out") | `Subject` (multicast, niente storico) |
| **Stato condiviso** tra componenti scollegati, con replay del valore corrente | `BehaviorSubject` (consumato come `Observable`) |
| **Wrap di codice legacy/RxJS-based** (interceptor, gateway HTTP, libreria che emette) | Subject/BehaviorSubject, perché il mondo intorno parla "Observable" |

Esempio del seme: `cartItems = signal<CartItem[]>([])` nel ProductService è giusto —
i componenti consumano direttamente il signal nel template. Il toast invece passa per
BehaviorSubject perché:
- la *fonte* (servizio) e i *consumer* (componenti scollegati come `Toast`, ma anche
  potenzialmente interceptor in Mod 4) non si conoscono;
- si integra naturalmente con `takeUntilDestroyed` + pipe RxJS;
- è il pattern che ritroverete nel codice legacy che dovrete integrare.

> **Anteprima Mod 4**: un `errorInterceptor` può iniettare `NotificationService` e
> chiamare `error(...)` quando una HTTP risponde 5xx. La separazione "servizio
> publisher + componente subscriber" rende possibile questo riuso senza accoppiamenti.

---

## Errori comuni — Parte B

### B.1 Esporre il Subject pubblicamente

```typescript
notifications$ = new BehaviorSubject<Notification[]>([]);
// ❌ qualsiasi componente può fare notifications$.next(...) → caos
```

Fix: `private list$ = new BehaviorSubject(...)` + `readonly notifications$ = list$.asObservable()`.

### B.2 Mutare l'array invece di sostituirlo

```typescript
this.list$.value.push(n);
this.list$.next(this.list$.value);   // ❌ stesso riferimento — i subscriber non "vedono" il cambiamento
```

Subject confronta per riferimento (e anche se non lo facesse, il pattern immutable
evita un sacco di bug). Fix: `this.list$.next([...this.list$.value, n])`.

### B.3 Sottoscriversi senza unsubscribe

```typescript
ngOnInit() {
  this.notifications.notifications$.subscribe(list => this.list = list);
  // ❌ memory leak: il subject non completa, il componente sì
}
```

Fix: `takeUntilDestroyed(this.destroyRef)` o `async` pipe nel template.

### B.4 `BehaviorSubject` senza valore iniziale

```typescript
private list$ = new BehaviorSubject<Notification[]>();  // ❌ Argument required
```

`BehaviorSubject<T>(initial)` richiede l'initial value. Se non sai cosa metterci,
spesso vuoi un `Subject<T>()` semplice (senza replay) o un `ReplaySubject<T>(1)` per
casi avanzati.

---

## Schema riassuntivo

```
PARTE A — Wrapping libreria legacy                    PARTE B — Subject/BehaviorSubject
──────────────────────────────────                     ──────────────────────────────────
afterNextRender(() => {                                @Injectable({ providedIn: 'root' })
  zone.runOutsideAngular(() => {                       class NotificationService {
    splide = new Splide(host, opts);                     private list$ = new BehaviorSubject<N[]>([]);
    splide.mount();                                      readonly notifications$ = list$.asObservable();
    splide.on('move', i =>
      zone.run(() => index.set(i)));                     success(msg) {
  });                                                       list$.next([...list$.value, {…}]);
});                                                       }
                                                       }
destroyRef.onDestroy(() =>
  splide?.destroy());                                  // consumer
                                                       inject(NotificationService).notifications$
                                                         .pipe(takeUntilDestroyed())
                                                         .subscribe(list => …);
```

| Voce | Sintassi chiave |
|---|---|
| Iniettare la zone | `inject(NgZone)` |
| Iniettare DestroyRef | `inject(DestroyRef)` |
| Inizializzare la libreria | `afterNextRender(() => { ... })` |
| Fuori zone | `zone.runOutsideAngular(() => { ... })` |
| Rientrare in zone | `zone.run(() => signal.set(...))` |
| Cleanup | `destroyRef.onDestroy(() => lib?.destroy())` |
| Subject puro | `new Subject<T>()` |
| BehaviorSubject con stato | `new BehaviorSubject<T>(initial)` |
| Esposizione read-only | `subject.asObservable()` |
| Valore corrente | `subject.value` o `subject.getValue()` |
| Auto-unsubscribe | `pipe(takeUntilDestroyed(destroyRef))` |

### File reali nel seme da citare in aula

| File | Cosa mostra | Note |
|---|---|---|
| [`src/app/services/product.ts`](../../progetto/product-catalog/src/app/services/product.ts) | `cartItems = signal<CartItem[]>([])` + `computed`/`effect` | Esempio di "stato locale → signal". Confronto col `NotificationService` del Lab 2 |
| — | Nessun uso di `NgZone` o di Splide nel seme | Sono novità del Mod 1c: arriveranno nel Lab 2 |

---

## Prossimo: [Lab 1 — ProductCard multi-slot + ProductQuickView dinamico](../lab-01/README.md)
