# 01 — Standalone Components + DI + inject()

> **Tempo:** ~18 min · **Slide:** TBD · **Blocco:** G1 Sessione 1 · 09:15–09:33 (apertura ripasso)

---

## Il problema

Il corso avanzato estende l'architettura del Product Catalog con **host directives**, **componenti dinamici** (`createComponent`), **librerie** e **SSR**. Tutte queste tecniche si appoggiano su due fondamenta del corso base: **standalone components** (niente `NgModule`) e **DI con `inject()`** (niente constructor injection). Prima di estenderle, ricordiamo come e perché ci si arriva — e dove le ritroveremo.

---

## Standalone: niente NgModule

In Angular pre-14 ogni componente doveva essere dichiarato in un `NgModule`, e ogni feature aveva il suo modulo (`SharedModule`, `FeaturesModule`, …). Standalone elimina questo livello: ogni componente **dichiara da solo** ciò che importa.

```typescript
// src/app/app.ts — root standalone (il seme è esattamente così)
import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { LiveTimer } from './components/live-timer/live-timer';
import { ProductService } from './services/product';

@Component({
  selector: 'app-root',
  standalone: true,                                  // ← niente NgModule
  imports: [RouterOutlet, Header, Footer, LiveTimer],// ← import locali al componente
  templateUrl: './app.html',
})
export class App {
  productService = inject(ProductService);
  readonly itemCount = computed(() => this.productService.itemCount());
}
```

Tre cose da notare:
- `standalone: true` (in Angular 21 è il default, ma resta esplicito nelle scaffolding del seme).
- `imports: [...]` contiene **solo i componenti/direttive realmente usati nel template**. Niente "modulo condiviso".
- L'`App` è il root component: viene avviato da `bootstrapApplication(App, appConfig)`.

---

## bootstrapApplication + app.config.ts

`bootstrapApplication` sostituisce `platformBrowserDynamic().bootstrapModule(AppModule)`. La configurazione (provider, router, http client) si dichiara in **`app.config.ts`**:

```typescript
// src/app/app.config.ts — esattamente come nel seme
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),     // ← router (Scheda 04)
    provideHttpClient(),       // ← HttpClient (Scheda 03)
  ],
};
```

I `provide*` funzionali rimpiazzano i vecchi `RouterModule.forRoot()` / `HttpClientModule`. È qui che aggiungeremo gli **interceptor** nel Mod 4 (`provideHttpClient(withInterceptors([...]))`).

---

## Dependency Injection in tre righe

DI = chiedi un'istanza, Angular te la dà. Tre passaggi:

```
1. Dichiari un servizio iniettabile
   ┌──────────────────────────────────────┐
   │ @Injectable({ providedIn: 'root' })  │  ← singleton applicativo
   │ export class ProductService { ... }  │
   └──────────────────────────────────────┘
                       │
2. Un componente lo chiede                 ▼
   ┌──────────────────────────────────────┐
   │ private svc = inject(ProductService);│  ← Angular costruisce
   │                                      │     o riusa l'istanza
   └──────────────────────────────────────┘
                       │
3. Lo usi                                  ▼
   this.svc.getProducts().subscribe(...)
```

`providedIn: 'root'` = **una sola istanza per tutta l'app** (tree-shakable: se nessuno lo inietta, non finisce nel bundle).

---

## inject() vs constructor injection

Storicamente DI si faceva in costruttore:

```typescript
// ❌ Stile pre-14: ancora supportato, ma evitalo nei progetti nuovi
constructor(private http: HttpClient, private router: Router) {}
```

Con `inject()` la stessa dipendenza si dichiara **come campo** del componente/servizio:

```typescript
// ✅ Stile moderno (Angular 14+): è quello che il seme usa ovunque
import { inject } from '@angular/core';

export class ProductService {
  private http = inject(HttpClient);
  // ...
}
```

Perché si preferisce `inject()`:

| Aspetto | Constructor injection | `inject()` |
|---|---|---|
| Sintassi nelle classi figlie | Va passato esplicitamente al `super(...)` | Niente, basta richiamarlo dove serve |
| Uso fuori da classi | Impossibile | Funziona in **functional guard**, **resolver**, **interceptor**, factory |
| Tipizzazione | Identica | Identica |
| Test | Si stuba via DI nel `TestBed` | Idem |

> **Vincolo importante**: `inject()` va chiamato in un **injection context** — tipicamente come inizializzatore di campo o dentro al `constructor`. Chiamarlo dentro a un metodo qualunque dà errore a runtime (`NG0203`).

---

## Dove l'avanzato lo estende

Tieni a mente questi tre punti — torneranno nei moduli successivi:

1. **Host directives** (Mod 1) — le direttive applicate a un host component si configurano in `@Component({ hostDirectives: [...] })`. È DI a livello di componente: lo stesso meccanismo, applicato alle direttive.
2. **Componenti dinamici** (Mod 1) — `ViewContainerRef.createComponent(Cmp)` istanzia un componente standalone **senza** template statico. Funziona solo perché i componenti sono standalone (non c'è un `NgModule` da risolvere).
3. **Interceptor funzionali** (Mod 4) — sono funzioni che usano `inject()` fuori da classi:
   ```typescript
   export const authInterceptor: HttpInterceptorFn = (req, next) => {
     const auth = inject(AuthService);   // ← inject() in una funzione
     // ...
   };
   ```

---

## Errori comuni

### 1. Importare un componente come se fosse un modulo

```typescript
// ❌ SBAGLIATO — non esistono più moduli da importare
imports: [CommonModule, SharedModule]
```
Standalone = importi **componenti, direttive e pipe**, uno per uno. Niente moduli. `CommonModule` non serve più: per `@if`/`@for` usi il **control flow** integrato (`@if`, `@for`, `@switch`), nessun import.

### 2. Chiamare `inject()` dentro a un metodo

```typescript
// ❌ SBAGLIATO — NG0203 a runtime
ngOnInit() {
  const svc = inject(ProductService);  // fuori dall'injection context
}

// ✅ CORRETTO — campo della classe
private svc = inject(ProductService);

ngOnInit() {
  this.svc.getProducts().subscribe(...);
}
```

### 3. Dimenticare di importare il componente figlio

```typescript
// ❌ SBAGLIATO — <app-header /> non viene riconosciuto
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],            // manca Header
  template: '<app-header />',
})
```
Errore: `'app-header' is not a known element`. Lo si risolve aggiungendo `Header` (la classe) all'array `imports`.

---

## Schema riassuntivo

```
bootstrapApplication(App, appConfig)
                              │
                              ▼
                      ┌──────────────┐
                      │ app.config.ts│  ◄── provideRouter, provideHttpClient,
                      └──────┬───────┘      provideZoneChangeDetection, …
                             │
                             ▼
                      ┌──────────────┐
                      │     App      │  ◄── standalone, imports: [Header, ...]
                      └──────┬───────┘
                             │ inject(ProductService)
                             ▼
                      ┌──────────────┐
                      │ProductService│  ◄── @Injectable({ providedIn: 'root' })
                      └──────────────┘      private http = inject(HttpClient)
```

| Concetto | Sintassi chiave | File reali nel seme |
|---|---|---|
| Standalone component | `@Component({ standalone: true, imports: [...] })` | [`src/app/app.ts`](../../progetto/product-catalog/src/app/app.ts), tutti i `components/*` |
| Configurazione app | `ApplicationConfig` + `provide*()` | [`src/app/app.config.ts`](../../progetto/product-catalog/src/app/app.config.ts) |
| Servizio iniettabile | `@Injectable({ providedIn: 'root' })` | [`src/app/services/product.ts`](../../progetto/product-catalog/src/app/services/product.ts) |
| Iniezione | `private x = inject(X)` | tutto il seme: `App`, `ProductService`, `authGuard`, … |

---

## Prossimo: [02 — Observable e RxJS Base](./02-observable-rxjs.md)
