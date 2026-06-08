# 03 — HttpClient

> **Tempo:** ~18 min · **Slide:** TBD · **Blocco:** G1 Sessione 1 · 09:51–10:09 (ripasso)

---

## Il problema

Il Product Catalog parla con un'API mock (`json-server` sul `db.json`) per leggere e scrivere prodotti. Lo strumento è `HttpClient`. Nel corso avanzato lo estendiamo in due punti:

- **Mod 4** — gli **interceptor** si inseriscono fra il codice del componente e la rete: aggiungono header (es. token JWT), gestiscono retry, redirect dopo 401.
- **Mod 6** — in **SSR** la prima fetch parte sul server; per evitare che il client la rifaccia, useremo `TransferState` per "spedire" la risposta nell'HTML.

Per arrivarci dobbiamo essere a posto su: come si configura, come si fa una GET/POST tipizzata, come si gestiscono gli errori.

---

## Setup: provideHttpClient()

`HttpClient` è un servizio iniettabile, ma va abilitato globalmente registrando il provider nell'`app.config.ts` (vedi anche la [Scheda 01](./01-standalone-di-inject.md)):

```typescript
// src/app/app.config.ts — esattamente come nel seme
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),     // ← questa riga abilita HttpClient
  ],
};
```

Una volta registrato, qualunque servizio o componente può **iniettarlo** con `inject(HttpClient)`. Nel corso avanzato vedrai questa stessa funzione accettare argomenti:

```typescript
// Anteprima Mod 4 — funzionerà solo dopo aver definito gli interceptor
provideHttpClient(
  withInterceptors([authInterceptor, errorInterceptor]),
)
```

---

## GET tipizzato: http.get<T>()

`HttpClient.get<T>(url)` ritorna un `Observable<T>` — il generico **dice a TypeScript** cosa aspettarsi nella risposta, ma **non valida i dati a runtime**. Il server è "creduto sulla parola".

```typescript
// src/app/services/product.ts — codice reale del seme
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = 'http://localhost:3000/products';
  private http = inject(HttpClient);

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

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`).pipe(
      catchError(() => throwError(() => new Error(`Prodotto con id ${id} non trovato.`))),
    );
  }
}
```

Notare:
- L'URL del singolo prodotto si costruisce con template literal: `${API_URL}/${id}` → `http://localhost:3000/products/3`.
- Il `catchError` traduce qualunque errore HTTP in un messaggio "umano" per il componente. La gestione raffinata per status code la facciamo in **Mod 4** (interceptor `errorInterceptor`).

---

## POST tipizzato: http.post<T>()

`HttpClient.post<T>(url, body)`:
1. **serializza** `body` in JSON (header `Content-Type: application/json`);
2. **invia** la richiesta `POST`;
3. **deserializza** la risposta nel tipo `T`.

`json-server` risponde con l'oggetto creato, includendo l'`id` auto-generato:

```typescript
// src/app/services/product.ts — codice reale del seme
addProduct(product: Omit<Product, 'id'>): Observable<Product> {
  return this.http.post<Product>(this.API_URL, product);
}
```

Lato chiamante:

```typescript
// src/app/pages/product-form/product-form.page.ts — onSubmit() reale
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
```

Tre stati nella UI: `isLoading`, `successMessage`, `errorMessage` — stesso pattern della Scheda 02.

---

## Mock con json-server

Il seme spedisce dati da un file `db.json` tramite `json-server`. Comando di avvio in aula:

```bash
# In una shell separata, dalla root del progetto:
npx json-server --watch db.json --port 3000
```

`db.json` contiene la collezione `products`:

```jsonc
// db.json — estratto del seme
{
  "products": [
    { "id": "1", "name": "MacBook Pro 14\"", "price": 2499, "category": "Laptop", ... },
    { "id": "2", "name": "iPhone 16 Pro",   "price": 1299, "category": "Smartphone", ... },
    ...
  ]
}
```

Per convenzione `json-server` mappa automaticamente:

| Metodo | URL | Cosa fa |
|---|---|---|
| `GET`  | `/products`       | Lista tutti i prodotti |
| `GET`  | `/products/:id`   | Un prodotto per id |
| `POST` | `/products`       | Crea (id auto-generato) |
| `PUT`  | `/products/:id`   | Sostituisce un prodotto |
| `PATCH`| `/products/:id`   | Aggiorna parziale |
| `DELETE`| `/products/:id`  | Elimina |

Negli esercizi avanzati useremo `PUT`/`DELETE` ma il pattern non cambia: cambia solo il metodo del `http.*` e la firma del tipo restituito.

---

## Gestione errori: cosa succede a runtime

Un errore HTTP arriva sempre come `HttpErrorResponse` nel callback `error` di `subscribe` (o nell'argomento di `catchError`). I campi utili:

```typescript
catchError((err: HttpErrorResponse) => {
  console.log(err.status);     // numero: 0 (no rete), 401, 404, 500, …
  console.log(err.statusText); // 'Not Found', 'Unauthorized', …
  console.log(err.url);        // l'URL chiamato
  console.log(err.error);      // body della risposta (se c'era)
  return throwError(() => err);
})
```

Convenzioni che torneranno nei moduli avanzati:

| Status | Significato tipico | Cosa fa il corso |
|---|---|---|
| **0** | Rete giù / CORS | Toast "controlla la connessione" — Mod 1d (NotificationService) |
| **401 Unauthorized** | Token mancante o scaduto | `authInterceptor` rilancia con token aggiornato — **Mod 4** |
| **403 Forbidden** | Autenticato ma senza permessi | Redirect a "/forbidden" |
| **404 Not Found** | Risorsa inesistente | Pagina dedicata o `Observable` vuoto |
| **5xx Server error** | Errore lato server | `retry(2)` + messaggio — **Mod 4** |

Per ora il seme tratta tutto in un solo `catchError` con messaggio fisso: va bene per il base, **diventa insufficiente** per un'app reale. La gestione granulare è il cuore di Mod 4.

---

## Errori comuni

### 1. Dimenticare `provideHttpClient()` nell'`app.config.ts`

Sintomo: a runtime `NullInjectorError: No provider for HttpClient!`. Soluzione: aggiungilo all'array `providers`.

### 2. Hard-coding di URL in più punti

```typescript
// ❌ URL ripetuto in ogni metodo → fragile (cambio porta = giro file)
getProducts() { return this.http.get('http://localhost:3000/products'); }
addProduct(p) { return this.http.post('http://localhost:3000/products', p); }
```
Nel seme la costante è centralizzata: `private readonly API_URL = 'http://localhost:3000/products';`. In Mod 5 (librerie) vedrete come parametrizzarla con un `InjectionToken`.

### 3. Confidare nel `<T>` come validazione

```typescript
this.http.get<Product[]>(url).subscribe(data => {
  // TS pensa che 'data' sia Product[], ma se il server risponde { error: ... }
  // il runtime non si accorge di nulla — e crashi al primo data[0].name
});
```
`<T>` è solo un'asserzione di tipo per TS. Se il rischio di payload errati è reale → schema validation (`zod`, `io-ts`) o `map(...)` con un transform esplicito.

### 4. Pensare che `subscribe()` blocchi

```typescript
// ❌ products è ancora vuoto qui sotto: subscribe è asincrono
this.productService.getProducts().subscribe(d => this.products = d);
console.log(this.products); // []
```

---

## Dove l'avanzato lo estende

| Modulo | Cosa aggiunge | Come |
|---|---|---|
| **Mod 4 — Interceptors** | Header automatici (auth), retry, gestione errori centralizzata | `provideHttpClient(withInterceptors([...]))` + `HttpInterceptorFn` |
| **Mod 6 — SSR** | La prima fetch parte sul server e non si ripete sul client | `TransferState` + chiave per il payload pre-renderizzato |
| **Mod 3 — Routing** | I parametri di rotta diventano un Observable da cui derivano nuove fetch | `route.paramMap.pipe(switchMap(...))` |

---

## Schema riassuntivo

```
                                    ┌────────────────────┐
appConfig.providers: provideHttpClient()
                                    └────────┬───────────┘
                                             │  abilita
                                             ▼
   inject(HttpClient)  ──▶  this.http.get<T>(url)
                                 │
                                 ▼
                      .pipe(catchError(...))
                                 │
                                 ▼
                       Observable<T>
                                 │
   componente.subscribe({ next, error })
                ▲
                │ futuri layer del corso
                │
   ┌────────────┴────────────┐
   │  Mod 4: interceptor      │  ◄── aggiunge header / retry / error
   │  Mod 6: TransferState    │  ◄── salta la fetch lato client in SSR
   └─────────────────────────┘
```

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/app.config.ts`](../../progetto/product-catalog/src/app/app.config.ts) | `provideHttpClient()` |
| [`src/app/services/product.ts`](../../progetto/product-catalog/src/app/services/product.ts) | `http.get<Product[]>`, `http.post<Product>`, `catchError` + `throwError` |
| [`src/app/pages/product-form/product-form.page.ts`](../../progetto/product-catalog/src/app/pages/product-form/product-form.page.ts) | `addProduct(...).subscribe({next,error})` con loading/success/error |
| [`db.json`](../../progetto/product-catalog/db.json) | Dati mock serviti da `json-server` |

---

## Prossimo: [04 — Routing SPA + Lazy Loading](./04-routing-lazy.md)
