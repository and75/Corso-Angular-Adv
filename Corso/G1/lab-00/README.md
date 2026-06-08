# Lab 0 — Setup + Mini-esercizio inject() + Observable
### Giorno 1 · Lab di apertura

---

## Obiettivo

Far partire il progetto del corso e ripassare in 1 esercizio i due "ponti" più frequenti
del corso base — `inject()` e `Observable` — agganciandoli a un componente esistente
del catalogo. Niente concetti nuovi: solo mani sul progetto su cui costruiremo i moduli
avanzati nei prossimi 24 ore.

Al termine vedrai nell'header un piccolo badge che mostra **quanti prodotti** ci sono
in catalogo, alimentato dal `ProductService` esistente.

---

## File modificati in questo lab

> Il resto del progetto è **invariato**. Tocchi solo i due file qui sotto.

| File | Ruolo |
|---|---|
| `src/app/components/header/header.ts` | Iniezione del servizio + sottoscrizione all'Observable |
| `src/app/components/header/header.html` | Mostra il badge con il conteggio |

---

## Parte 1 — Setup del progetto (10 min)

1. **Apri la cartella del progetto** in VS Code:
   ```bash
   cd Corso/progetto/product-catalog
   code .
   ```
2. **Installa le dipendenze** (la prima volta):
   ```bash
   npm install
   ```
3. **Avvia json-server** (in una shell separata, sempre dalla cartella del progetto):
   ```bash
   npx json-server --watch db.json --port 3000
   ```
4. **Avvia l'app Angular**:
   ```bash
   ng serve
   ```
   Apri `http://localhost:4200` e verifica di vedere la home con i prodotti.

### Tour rapido del codice (5 min)

| Dove guardare | Cosa contiene |
|---|---|
| `src/app/app.routes.ts` | Definizione delle rotte (eager + 3 `loadComponent`) |
| `src/app/app.config.ts` | `provideHttpClient`, `provideRouter` |
| `src/app/services/product.ts` | Il `ProductService` con `getProducts(): Observable<Product[]>` |
| `src/app/pages/` | Le pagine: home, product-detail, product-form, checkout, login, admin |
| `src/app/components/` | I componenti riusati: header, footer, product-card, search-bar, … |

Da qui in poi, lavorerai **solo** dentro `src/app/components/header/`.

---

## Parte 2 — Mini-esercizio (15 min)

Apri **`src/app/components/header/header.ts`**: nel codice di partenza trovi 2 TODO già
commentati. Le note di confronto rispetto allo `Header` originale del seme te le segnaliamo qui:
prima nell'header c'erano **solo** due `@Input()` (`appName`, `cartCount`) e nessuna logica.
Tu introduci la prima dipendenza iniettata e la prima sottoscrizione.

### TODO 1 — FACILE: inject() del ProductService

In testa al file aggiungi l'import:

```typescript
import { ProductService } from '../../services/product';
```

Dentro la classe `Header`, come **inizializzatore di proprietà** (NON dentro un metodo),
aggiungi:

```typescript
private productService = inject(ProductService);
```

Nota: `inject` va aggiunto anche nell'`import` da `@angular/core`.

### TODO 2 — MEDIO: subscribe() all'Observable e salva il numero

Aggiungi una proprietà `productCount` e implementa `ngOnInit` (la classe deve dichiarare
`implements OnInit`):

```typescript
productCount = 0;

ngOnInit(): void {
  this.productService.getProducts().subscribe({
    next: (products) => this.productCount = products.length,
    error: () => this.productCount = 0,
  });
}
```

L'Observable di `getProducts()` emette un solo valore (la risposta HTTP) — sei a posto
con un `subscribe` semplice, senza `takeUntilDestroyed` (vedi Scheda 02).

### TODO 3 — Template: mostra il badge

Apri **`src/app/components/header/header.html`** e dentro al `<div class="flex items-center gap-3">`
(il blocco col logo "GS" e l'`appName`), aggiungi sotto il nome dell'app:

```html
<span class="text-xs opacity-80">{{ productCount }} in catalogo</span>
```

---

## Criteri di verifica

- [ ] Hai aggiunto `inject` e `OnInit` all'`import` da `@angular/core`, e `ProductService` dal servizio.
- [ ] `private productService = inject(ProductService);` è dichiarato **come campo** della classe (non dentro a un metodo).
- [ ] La classe `Header` implementa `OnInit` e ha `ngOnInit()` che sottoscrive `getProducts()`.
- [ ] Nel template compare il testo "X in catalogo" sotto al nome dell'app.
- [ ] L'app si avvia senza errori (`ng serve` non si rompe; nessun errore in console del browser).
- [ ] Il numero che vedi nell'header **coincide** col numero di prodotti in `db.json`.
- [ ] Tutte le altre funzioni del catalogo continuano a funzionare (ricerca, carrello, navigazione).

---

## Se ti blocchi

| Errore | Probabile causa | Dove guardare |
|---|---|---|
| `NG0203: inject() must be called from an injection context` | Hai chiamato `inject(...)` dentro un metodo invece che come campo della classe | TODO 1 |
| `0 in catalogo` sempre | `json-server` non gira o gira su un'altra porta | Parte 1 step 3 |
| `Property 'productCount' does not exist on type 'Header'` | Hai usato `productCount` nel template ma non l'hai dichiarato nella classe | TODO 2 |
| L'app crasha all'avvio con `No provider for HttpClient` | Improbabile (`provideHttpClient` è già in `app.config.ts`), ma controlla di non averlo rimosso | `src/app/app.config.ts` |

Soluzione completa in `solution/` (apri solo dopo aver tentato!).
