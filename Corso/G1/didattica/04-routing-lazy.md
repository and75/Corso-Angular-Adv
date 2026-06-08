# 04 — Routing SPA + Lazy Loading

> **Tempo:** ~18 min · **Slide:** TBD · **Blocco:** G1 Sessione 1 · 10:09–10:27 (ripasso)

---

## Il problema

Il Product Catalog è una Single Page Application: la prima richiesta scarica l'HTML, poi il router Angular gestisce la navigazione **senza ricaricare la pagina**. Le pagine pesanti (checkout, form prodotto) sono caricate **on-demand** con `loadComponent`.

Nel corso avanzato, **Mod 3** estende tutto questo con:
- **children routing** e **`loadChildren`** per le feature areas (es. area `admin/*` con sotto-rotte);
- **`<router-outlet>` annidati** e **named outlet** (più aree visibili contemporaneamente, es. pannello laterale).

Per arrivarci serve essere a posto su come si definiscono le rotte, come si leggono i parametri, come si protegge una rotta con una guard.

---

## Le tre righe che fanno funzionare il router

1. **Provider** in `app.config.ts`: `provideRouter(routes)` (vedi [Scheda 01](./01-standalone-di-inject.md)).
2. **Outlet** nel template del componente root: `<router-outlet />`.
3. **Routes** — l'elenco delle rotte in `app.routes.ts`.

```typescript
// src/app/app.config.ts — esattamente come nel seme
providers: [
  provideRouter(routes),
  provideHttpClient(),
]
```

```html
<!-- src/app/app.html (estratto) -->
<app-header />
<main>
  <router-outlet />   <!-- ← qui viene montata la pagina corrispondente all'URL -->
</main>
<app-footer />
```

---

## Routes: la mappa URL → componente

Il seme dichiara le rotte in `src/app/app.routes.ts`:

```typescript
// src/app/app.routes.ts — codice reale del seme
import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { authGuard } from './auth-guard';
import { Login } from './pages/login/login.page';
import { Admin } from './pages/admin/admin.page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',  component: HomePage },
  { path: 'login', component: Login },
  { path: 'admin', canActivate: [authGuard], component: Admin },

  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
  },

  // ✅ products/new PRIMA di products/:id — "new" non venga catturato come :id
  {
    path: 'products/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/product-form/product-form.page').then(m => m.ProductFormPage),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage),
  },
];
```

Quattro forme presenti nel seme — **da riconoscere a colpo d'occhio**:

| Forma | Sintassi nel seme | Cosa fa |
|---|---|---|
| Redirect | `{ path: '', redirectTo: 'home', pathMatch: 'full' }` | Manda `/` su `/home` |
| Eager | `{ path: 'home', component: HomePage }` | Componente nel main bundle |
| Lazy | `loadComponent: () => import(...)` | Componente in un chunk separato (vedi sotto) |
| Protetta | `canActivate: [authGuard]` | La guard può bloccare o redirezionare |

> **Ordine importa.** Le rotte si valutano in sequenza: `products/new` viene **prima** di `products/:id`, altrimenti `'new'` finirebbe catturato come `:id`. Errore tipico in aula — vale la pena fermarsi un secondo.

---

## Lazy loading: `loadComponent`

`loadComponent` ritorna una **Promise di un componente standalone**. Angular ne fa code-splitting: il bundle viene scaricato **solo quando l'utente naviga** verso quella rotta.

```typescript
{
  path: 'checkout',
  loadComponent: () =>
    import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
}
```

In aula lo si vede aprendo la **Network** del browser: navigando in `/checkout` parte una richiesta `chunk-XXXX.js`. Per pagine usate da una minoranza di utenti (admin, form), lo speed-up sull'avvio è significativo.

> **Vincolo**: `loadComponent` accetta **un solo componente standalone**. Per un gruppo di rotte (es. tutta l'area `admin/*` con liste, dettaglio, edit) serve `loadChildren` — è la novità di **Mod 3**.

---

## Parametri di rotta: leggere `:id`

`products/:id` significa che la stringa nel posto di `:id` finisce in `route.snapshot.paramMap`:

```typescript
// src/app/pages/product-detail/product-detail.page.ts — codice reale del seme
@Component({ /* ... */ })
export class ProductDetailPage implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private productService = inject(ProductService);

  product   = signal<Product | null>(null);
  isLoading = signal(true);
  error     = signal('');

  ngOnInit(): void {
    // snapshot.paramMap.get() restituisce sempre una stringa o null
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/home']);   // ← navigazione programmatica
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: p  => { this.product.set(p);  this.isLoading.set(false); },
      error: () => { this.error.set('Prodotto non trovato.'); this.isLoading.set(false); },
    });
  }
}
```

Due cose da notare per il dopo:
- `route.snapshot.paramMap` **fotografa** il valore al primo `ngOnInit`. Se l'utente naviga da `/products/1` a `/products/2` **senza cambiare componente**, lo snapshot non si aggiorna. Per quel caso si usa `route.paramMap` (Observable) → **Mod 3** lo riprende con `switchMap`.
- `router.navigate([...])` è la navigazione programmatica. Da template si usa `<a routerLink="/...">` (è quello che fa l'`Header` del seme).

---

## Guard: proteggere una rotta

Nel seme le rotte `admin` e `products/new` richiedono autenticazione. La guard è una **functional guard** (Angular 14+):

```typescript
// src/app/auth-guard.ts — codice reale del seme
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  if (token) {
    return true;                                  // ← rotta permessa
  }
  return router.createUrlTree(['/login']);        // ← redirect a /login
};
```

Una guard può ritornare:
- `true` / `false` — permetti o blocca;
- un `UrlTree` (`router.createUrlTree(...)`) — Angular naviga lì invece di continuare;
- un `Observable` o `Promise` di uno dei tre — per controlli asincroni.

`inject()` funziona qui perché Angular chiama la guard dentro un **injection context**: stesso meccanismo di `inject()` in componenti e servizi (Scheda 01).

---

## Aprire un link: `routerLink`

Nel `Header` del seme:

```html
<!-- estratto di app/components/header/header.html -->
<nav>
  <a routerLink="/home"        routerLinkActive="font-bold">Home</a>
  <a routerLink="/products/new" routerLinkActive="font-bold">Nuovo prodotto</a>
  <a [routerLink]="['/products', product.id]">Dettaglio</a>
</nav>
```

`routerLink` può essere stringa (`/home`) o array (`['/products', id]`) — la forma array è utile quando il segmento è dinamico.

---

## Errori comuni

### 1. Ordine sbagliato delle rotte

```typescript
// ❌ /products/new viene catturato come :id → component sbagliato
{ path: 'products/:id', loadComponent: () => import('...detail') },
{ path: 'products/new', loadComponent: () => import('...form') },
```
Il seme ha l'ordine corretto: `products/new` prima di `products/:id`.

### 2. Dimenticare `pathMatch: 'full'` nel redirect

```typescript
// ❌ pathMatch:'prefix' (default) → /anything finisce su /home
{ path: '', redirectTo: 'home' }

// ✅ Match esatto solo su '/'
{ path: '', redirectTo: 'home', pathMatch: 'full' }
```

### 3. Usare `snapshot.paramMap` quando il param cambia senza distruggere il componente

```typescript
// ❌ Solo la prima visita a /products/:id legge il param
const id = this.route.snapshot.paramMap.get('id');

// ✅ paramMap è un Observable: emette ogni volta che cambia
this.route.paramMap.subscribe(p => {
  const id = p.get('id');
  // ...
});
```
Per il **base** lo snapshot va bene (ogni dettaglio prodotto monta un componente nuovo). In **Mod 3**, con outlet annidati, lo stesso componente può rimanere montato — lì serve `paramMap` Observable + `switchMap`.

### 4. Lazy con un nome export sbagliato

```typescript
// ❌ Il modulo non esporta CheckoutPage con quel nome → errore a runtime
loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.Checkout)

// ✅ Verifica il nome esportato dalla classe
loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage)
```

---

## Dove l'avanzato lo estende (Mod 3)

| Concetto | Cosa cambia | Esempio Mod 3 |
|---|---|---|
| `loadChildren` | Lazy di un **gruppo** di rotte (feature area) | Tutta l'area `admin/*` in un solo chunk |
| `children: [...]` | Sotto-rotte rispetto a una rotta padre | `/admin` con `users`, `products`, `orders` |
| `<router-outlet />` annidati | Più aree montate contemporaneamente | Master/detail: lista a sinistra, dettaglio a destra |
| Named outlet | Più outlet "secondari" indirizzabili nell'URL | `<router-outlet name="aside" />` con URL `(aside:settings)` |
| `paramMap` reattivo | Param che cambiano senza re-mount | `route.paramMap.pipe(switchMap(...))` |

---

## Schema riassuntivo

```
                  URL
                   │
                   ▼
          ┌─────────────────┐
          │  Routes match   │   ← in ordine, prima rotta che matcha vince
          └────────┬────────┘
                   │
       ┌───────────┼────────────────┬─────────────────┐
       ▼           ▼                ▼                 ▼
   eager      loadComponent      redirect        canActivate
   component  (chunk lazy)       pathMatch       [authGuard]
                   │                                  │
                   ▼                                  ▼
            <router-outlet>                  true / false / UrlTree
```

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/app.routes.ts`](../../progetto/product-catalog/src/app/app.routes.ts) | Redirect, eager, `loadComponent`, `canActivate` |
| [`src/app/auth-guard.ts`](../../progetto/product-catalog/src/app/auth-guard.ts) | `CanActivateFn` con `inject(Router)` + `createUrlTree(['/login'])` |
| [`src/app/pages/product-detail/product-detail.page.ts`](../../progetto/product-catalog/src/app/pages/product-detail/product-detail.page.ts) | `route.snapshot.paramMap.get('id')` + navigazione programmatica `router.navigate([...])` |
| [`src/app/components/header/header.ts`](../../progetto/product-catalog/src/app/components/header/header.ts) | `RouterLink` / `RouterLinkActive` nel template |

---

## Prossimo: [05 — Reactive Forms base + ng-content](./05-reactive-forms-ngcontent.md)
