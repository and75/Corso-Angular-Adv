# Lab 0 — Setup + inject()/Observable
## Guida per il Docente

---

## 1. Scopo Didattico

Lab di apertura del corso avanzato. Tre obiettivi paralleli:

1. **Sblocca l'ambiente** — ogni studente arriva alla home con `ng serve` funzionante e
   `json-server` su porta 3000. Tutto il resto del corso si basa su questo.
2. **Ripassa "con le dita"** i due pattern più ricorrenti del corso base: `inject()` come
   inizializzatore di proprietà e `.subscribe()` su un Observable di `HttpClient`.
3. **Crea il "ponte" mentale**: il valore mostrato nell'header viene da `ProductService`.
   Negli moduli avanzati lo stesso servizio verrà esteso (cart con Subject in M1d,
   interceptor in M4, TransferState in M6) — gli studenti vedranno crescere quel pezzo di
   codice mantenendo lo stesso identico paradigma.

---

## 2. Timing Consigliato

**Slot orario: 11:00–11:30 (30 minuti)**

| Fase | Attività | Durata |
|---|---|---|
| Setup individuale | `npm install` (se non già fatto) + `json-server` + `ng serve` | 8 min |
| Tour codice | Mostrare a video la struttura del progetto (Tabella nel README studente) | 5 min |
| TODO 1 + TODO 2 + TODO 3 | inject + subscribe + binding nel template | 12 min |
| Verifica + Q&A | Tutti vedono il badge "N in catalogo" + sanity dei criteri di verifica | 5 min |
| **Totale** | | **30 min** |

> Se la classe è disomogenea e qualcuno è già installato/avviato da casa, mandalo avanti
> coi TODO mentre gli altri completano il setup. La parte tecnica del lab è breve di
> proposito — il vero valore è il setup pulito che servirà a tutti per le 21 ore successive.

---

## 3. Contesto nella Scaletta

Questo lab arriva subito dopo le 5 schede del ripasso ponte (09:15–10:45) e una pausa
(10:45–11:00). Gli studenti hanno già sentito parlare di standalone/DI, RxJS, HttpClient,
routing e Reactive Forms. Il lab è il primo momento "in cui scrivono codice loro".

**Messaggio chiave da trasmettere all'inizio:**
> "Per le prossime 21 ore aggiungeremo cose a questo progetto. Oggi nessun concetto nuovo:
> controlliamo solo che l'ambiente di tutti sia uguale, e ci ricordiamo come si fa una
> `inject()` e una `subscribe()` — perché le ripeteremo in ogni modulo."

---

## 4. Setup — Cose che vanno male in aula

| Sintomo | Causa tipica | Workaround |
|---|---|---|
| `npm install` lento o fallisce | Proxy aziendale o npm registry interno | Avere un mirror locale o `--registry=https://registry.npmjs.org/` |
| Porta 3000 occupata | Altro `json-server` in background | `--port 3001` e ricordarsi di aggiornare `API_URL` in `services/product.ts` (solo per la sessione, non in repo) |
| `ng: command not found` | Angular CLI non globale | `npx ng serve` |
| App parte ma mostra "0 in catalogo" | `json-server` non avviato | Mostrare la chiamata fallita in Network |

---

## 5. Soluzione Commentata — Punti chiave

### 5.1 `inject()` come inizializzatore di proprietà

```typescript
export class Header implements OnInit {
  private productService = inject(ProductService);
  // ...
}
```

**Cosa dire agli studenti:**
> "`inject()` funziona SOLO nell'injection context — cioè come inizializzatore di campo
> della classe o dentro al constructor. Chiamarlo in `ngOnInit`, in un evento o in un
> metodo qualunque lancia `NG0203` a runtime. Regola pratica del corso: in alto, vicino
> agli altri campi privati."

### 5.2 Subscribe semplice — senza takeUntilDestroyed

```typescript
ngOnInit(): void {
  this.productService.getProducts().subscribe({
    next: (products) => this.productCount = products.length,
    error: () => this.productCount = 0,
  });
}
```

**Cosa dire:**
> "Per le chiamate HTTP non serve `takeUntilDestroyed`: l'Observable emette un solo
> valore e poi completa. Lo aggiungerete (con `inject(DestroyRef)`) quando vi
> sottoscriverete a Subject o `valueChanges` di un form — ne riparliamo nel Mod 1d
> e nel ripasso form del Mod 2."

### 5.3 Confronto storico: constructor injection (da mostrare a voce, NON nel codice)

Da raccontare alla lavagna o a slide solo se la classe chiede "perché non nel constructor?":

```typescript
// Stile pre-14 (ancora supportato, ma non lo usiamo):
constructor(private productService: ProductService) {}

// Stile moderno — quello del corso (e del seme):
private productService = inject(ProductService);
```

**Differenze da menzionare in 30 secondi:**
- Costruttore: ogni classe figlia deve riportare tutte le dipendenze nel `super(...)`.
- `inject()`: funziona anche **fuori** da classi — interceptor funzionali (Mod 4),
  functional guard (vedi Scheda 04), `Resolver`, factory.
- Internamente fanno la stessa cosa: stesso meccanismo di DI, stessa istanza.

Non scrivere la versione constructor nella `solution/`: lascia il seme coerente con lo
stile `inject()`.

---

## 6. Errori comuni degli studenti

### ❌ Errore 1: `inject()` chiamato dentro `ngOnInit`
**Sintomo:** errore a runtime `NG0203: inject() must be called from an injection context`.
**Fix:** spostarlo come campo della classe.

### ❌ Errore 2: dimenticano `implements OnInit`
**Sintomo:** TypeScript non si lamenta (perché `ngOnInit` resta solo un metodo), ma
Angular non lo chiama mai → il badge resta a 0.
**Fix:** `export class Header implements OnInit { ... }` + import `OnInit` da `@angular/core`.

### ❌ Errore 3: import sbagliato del servizio
**Sintomo:** `Cannot find module '../../services/product.service'`.
**Causa:** il file del seme si chiama `services/product.ts`, **non** `product.service.ts`
(convenzione Angular 21).
**Fix:** `import { ProductService } from '../../services/product';`.

### ❌ Errore 4: subscribe assegna direttamente la lunghezza con la sintassi sbagliata
**Sintomo:** errore TypeScript o sempre 0.
**Causa tipica:** `next: (products) => products.length` (senza assegnazione) o
`this.productCount(products.length)` (lo trattano come funzione).
**Fix:** `next: (products) => this.productCount = products.length`.

### ❌ Errore 5: aggiungono il binding al posto sbagliato nel template
**Sintomo:** non vedono il badge.
**Causa:** lo aggiungono dentro al `<nav>` di destra o fuori dal `<header>`.
**Fix:** dentro al `div.flex.items-center.gap-3` del logo, **subito sotto** lo
`<span>{{ appName }}</span>`.

---

## 7. Domande frequenti

**Q: Perché non usare `httpClient.get` direttamente nell'Header?**
A: Perché il servizio è già lì e centralizza l'URL, la gestione errori (`catchError`+`throwError`),
e domani gli aggiungeremo header automatici via interceptor (Mod 4). Il componente non
deve conoscere l'API.

**Q: Posso usare un signal invece di una proprietà?**
A: Sì, ma in questo lab usiamo il pattern più semplice possibile (proprietà + subscribe).
In Mod 1 vedremo come `signal`/`computed` interagiscono con `Subject`. Per ora teniamo
il livello "ponte" col corso base.

**Q: Cosa succede se chiamo `subscribe` due volte?**
A: Parte due chiamate HTTP. È un problema (rete sprecata) e in pratica si risolve con
`shareReplay(1)` nel servizio. Per il Lab 0 non ci preoccupiamo — sottoscriviamo una sola
volta, in `ngOnInit`.

**Q: Devo cancellare la subscription?**
A: Per HttpClient no, si completa da sola (vedi Scheda 02). Per Observable infiniti
(Subject, valueChanges, interval) sì, con `takeUntilDestroyed(this.destroyRef)`.

---

## 8. Adattamenti

### Classe veloce (resta tempo):
- Chiedere "come riscrivereste tutto usando un `signal<number>` invece di `productCount: number`?"
  → risposta: `productCount = signal(0)` + `this.productCount.set(products.length)` +
  binding `{{ productCount() }}`.
- Anticipare il pattern del Mod 1d: cosa cambierebbe con un `BehaviorSubject<Product[]>`?

### Classe lenta:
- Tagliare il TODO 2: lasciare `productCount` cablato a una costante (`= 6`) e fare
  solo l'inject. L'obiettivo "vedere un valore arrivato dal servizio" si raggiunge
  comunque al prossimo modulo.
- Concentrarsi sul setup: il valore del lab è che ng serve giri a tutti.

### Cosa NON approfondire ora:
- `takeUntilDestroyed` / `DestroyRef` — arriva in Mod 1d.
- `signal`/`computed` — il seme li usa già nel `ProductService`, ma li lasciamo "magici"
  per il Lab 0; ne riparliamo a M1.
- `Subject` / `BehaviorSubject` — Mod 1d.
- Interceptor — Mod 4.

---

## 9. Verifica NAP (binario A)

A fine lab, applicare i due file di `solution/` (`header.ts`, `header.html`) sopra a
`Corso/progetto/product-catalog-finale/src/app/components/header/`, poi:

```bash
cd Corso/progetto/product-catalog-finale
npx ng build         # atteso: Application bundle generation complete
npx ng test          # atteso: Test Files passed, Tests passed
```

Il seme `Corso/progetto/product-catalog/` resta intatto.
