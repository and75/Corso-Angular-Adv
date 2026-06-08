# Stato dei progetti

In `Corso/progetto/` ci sono **due progetti distinti**, con ruoli complementari:

| Progetto | Ruolo | Modifiche |
|---|---|---|
| `product-catalog/` | **Seme didattico**: punto di partenza che lo studente vede in aula, citato dalle schede del corso | **Frozen**: nessun modulo avanzato lo modifica |
| `product-catalog-finale/` | **Progetto di verifica**: qui si applicano cumulativamente le `solution/` dei lab e si lancia `ng build` (binario A della verifica NAP) | **Incrementale**: cresce modulo dopo modulo |

Entrambi partono dallo stesso stato iniziale: **Product Catalog finito del corso base (72h)**,
copiato da `AngularBase72h/Corso/product-catalog/` (versione finita e funzionante).

## Contenuto verificato (entrambi i progetti, stato iniziale)

- ✅ Standalone components: `header`, `footer`, `product-card`, `product-list`, `search-bar`, `cart-summary`, `card-container`, `live-timer`
- ✅ `product.model.ts` + `services/` (`product.ts`, `product.service.ts`) con **HttpClient** configurato
- ✅ Routing completo (`app.routes.ts`) con pagine: `home`, `product-detail`, `product-form`, `checkout`, `admin`, `login`
- ✅ `auth-guard`, `directives/highlight`, `pipes/filter-products-pipe`, `validators/product.validators`
- ✅ Reactive Forms (checkout / product-form), cart con signals
- ✅ Angular 21 (`@angular/* ^21.2.0`)

## Avvio

In aula gli studenti partono dal seme:

```bash
cd Corso/progetto/product-catalog
npm install
ng serve        # http://localhost:4200
```

La verifica NAP gira sul progetto cumulativo:

```bash
cd Corso/progetto/product-catalog-finale
npm install
ng build
```

`node_modules/` e `.angular/` non sono inclusi: si rigenerano con `npm install`.

## Nota

Ogni lab produce un **delta** (file nuovi/modificati in `starter/` e `solution/`).
- Lo `starter/` viene applicato al seme dallo studente in aula come punto di partenza dell'esercizio.
- La `solution/` viene applicata cumulativamente a `product-catalog-finale/` per la verifica NAP `ng build`.
- Il seme `product-catalog/` resta sempre allo stato iniziale: nessuna sovrascrittura, mai.
