# 02 — Observable e RxJS Base

> **Tempo:** ~18 min · **Slide:** TBD · **Blocco:** G1 Sessione 1 · 09:33–09:51 (ripasso)

---

## Il problema

Il seme usa `HttpClient` per parlare con `json-server`, e ogni chiamata restituisce un `Observable`. Nel corso avanzato:
- **Mod 1** introduce `Subject` e `BehaviorSubject` per la comunicazione tra componenti (es. un `NotificationService`);
- **Mod 4** aggiunge gli **interceptor** che usano `pipe()` con `catchError` e `retry` per gestire errori e re-autenticazione.

Per arrivarci dobbiamo essere a posto su: *cos'è un Observable*, *come ci si sottoscrive*, *come si trasformano i dati con `pipe()`*. Questo è il ripasso.

---

## Cos'è un Observable (in una frase)

Un Observable è un **flusso di valori nel tempo**: lazy, parte solo quando qualcuno fa `.subscribe()`.

```
http.get<Product[]>('/products')
─────────────────────────────────
   [creato]   nessuno si è abbonato → la chiamata HTTP non parte

   .subscribe(...)                  ← qualcuno si abbona

   [HTTP request parte]
        │
        ├──── ~200 ms ────▶  next: [{ id:1 }, { id:2 }, ...]
        │
        └── [complete]               l'Observable finisce (HTTP è one-shot)
```

> **Mentale**: per `HttpClient` il flusso emette **un solo valore** (la risposta) e poi completa. Non vale per tutti gli Observable — un `interval()`, un `Subject` o un `valueChanges` di un form non finiscono mai.

---

## subscribe(): next, error, complete

`.subscribe()` accetta un oggetto con tre callback opzionali. Per `HttpClient` ne servono due:

```typescript
// src/app/pages/home/home.page.ts — pattern reale del seme
loadProducts(): void {
  this.isLoading = true;
  this.error = null;

  this.productService.getProducts().subscribe({
    next: data => {
      this.products = data;
      this.isLoading = false;
    },
    error: err => {
      this.error = err.message || 'Errore sconosciuto';
      this.isLoading = false;
    },
    // complete: non serve per HttpClient — viene chiamato dopo next, ma il dato è già a posto
  });
}
```

In `HomePage` Angular non ci pensa per noi: il **componente** decide quando partire (`ngOnInit`) e cosa fare in caso di successo/errore. Il template poi guida la UI con `@if (isLoading) {...} @else if (error) {...} @else {...}`.

---

## pipe() e gli operatori RxJS

Spesso il dato grezzo non è quello che serve al componente: va trasformato. Si fa nel **servizio**, dentro a `pipe()`:

```
Observable<Grezzo>
  .pipe(
    operatore1(),
    operatore2(),
    ...
  )
→ Observable<Trasformato>
```

Il componente riceve dati già pronti. Il servizio resta riusabile.

### map() — trasforma i valori

```typescript
import { map } from 'rxjs/operators';

getProductsAvailable(): Observable<Product[]> {
  return this.http.get<Product[]>(this.API_URL).pipe(
    map(products => products.filter(p => p.available)),
    // ↑ map RxJS                ↑ map Array — due cose diverse
  );
}
```

### catchError() — intercetta gli errori

Nel seme, `ProductService.getProducts()` fa proprio così:

```typescript
// src/app/services/product.ts — codice reale del seme
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(this.API_URL).pipe(
    catchError(err => {
      console.error('Errore caricamento prodotti:', err);
      return throwError(() => new Error(
        'Impossibile caricare i prodotti. Assicurati che json-server sia in esecuzione.'
      ));
    }),
  );
}
```

Due scelte di design importanti:
- `throwError(...)` ri-lancia un errore "pulito" al componente → la UI mostra il messaggio nell'`error` di `subscribe`.
- Alternativa: `return of([])` (un Observable che emette array vuoto) per **nascondere** l'errore al componente — comodo per UI che possono mostrare "nessun risultato" invece di un alert.

### of() — un Observable da un valore noto

```typescript
import { of } from 'rxjs';
of(42).subscribe(v => console.log(v)); // 42 → complete
```
Utile come fallback in `catchError`, nei test, o come placeholder.

### tap() — debug senza modificare il flusso

```typescript
import { tap } from 'rxjs/operators';

return this.http.get<Product[]>(url).pipe(
  tap(products => console.log('Grezzo:', products.length)),
  map(products => products.filter(p => p.available)),
  tap(products => console.log('Filtrato:', products.length)),
);
```

---

## Anticipazione: switchMap / debounceTime

Non li usiamo nel ripasso, ma li vedrete nei moduli avanzati:
- **`debounceTime(ms)`** — attende che il flusso si "calmi" prima di emettere (tipico per input di ricerca).
- **`switchMap(fn)`** — concatena chiamate annullando la precedente (tipico per `search → http.get`). Lo useremo nei lab di Mod 3 e Mod 4.

---

## Errori comuni

### 1. Dimenticare `.subscribe()`

```typescript
// ❌ Niente subscribe → la chiamata HTTP non parte mai
ngOnInit() {
  this.productService.getProducts();
}

// ✅ Subscribe in HomePage del seme
ngOnInit() {
  this.productService.getProducts().subscribe({ next: d => this.products = d });
}
```

### 2. `subscribe` dentro al servizio

```typescript
// ❌ Stato dentro al servizio: difficile da testare, accoppia UI e dati
getProducts(): void {
  this.http.get<Product[]>(url).subscribe(d => this.products = d);
}

// ✅ Il servizio restituisce l'Observable — è il componente che decide
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(url);
}
```

### 3. `map` nel posto sbagliato

```typescript
// ❌ map() di RxJS chiamato fuori da pipe()
this.http.get<Product[]>(url).map(p => p.name); // ts2339: Property 'map' does not exist

// ✅ dentro pipe()
this.http.get<Product[]>(url).pipe(
  map(products => products.map(p => p.name)),
);
```

### 4. Cosa NON facciamo nel ripasso

`takeUntilDestroyed()` per i memory leak: per le chiamate `HttpClient` non serve (si completano da sole). Diventa rilevante per Observable infiniti (`Subject`, `valueChanges`, `interval`). Ne parliamo nel **Mod 1d** insieme a `Subject`/`BehaviorSubject`.

---

## Dove l'avanzato lo estende

| Modulo | Cosa aggiunge | Operatori chiave |
|---|---|---|
| Mod 1d | `Subject`/`BehaviorSubject` per la comunicazione tra componenti (es. `NotificationService` con toast) | `next()`/`asObservable()`, `takeUntilDestroyed()` |
| Mod 4 | **Interceptor** funzionali per gestire errori HTTP e re-autenticazione | `catchError`, `retry`, `switchMap` |
| Mod 3 | Lazy + parametri di rotta reattivi (`route.paramMap`, `route.queryParamMap`) | `switchMap`, `distinctUntilChanged` |

---

## Schema riassuntivo

```
ProductService                                    HomePage
──────────────                                    ────────
http.get<Product[]>(API_URL)                      isLoading = true
  .pipe(                                          error = null
    catchError(err =>                             ┌─ next(data) → products = data
      throwError(() => new Error(...)))           │              isLoading = false
  )                                  subscribe ───┤
→ Observable<Product[]>                           └─ error(err) → error = err.message
                                                                 isLoading = false
```

| Operatore | Cosa fa |
|---|---|
| `map(fn)` | Trasforma ogni valore emesso |
| `tap(fn)` | Effetto collaterale (log) senza modificare il valore |
| `catchError(fn)` | Intercetta un errore: restituisci `of(...)` per nascondere o `throwError(...)` per rilanciare |
| `of(valore)` | Observable sincrono che emette `valore` e completa |
| `throwError(() => err)` | Observable che emette subito un errore |

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/services/product.ts`](../../progetto/product-catalog/src/app/services/product.ts) | `Observable<Product[]>` con `pipe(catchError(...))` |
| [`src/app/pages/home/home.page.ts`](../../progetto/product-catalog/src/app/pages/home/home.page.ts) | `.subscribe({ next, error })` reale con pattern loading/error/data |

---

## Prossimo: [03 — HttpClient](./03-httpclient.md)
