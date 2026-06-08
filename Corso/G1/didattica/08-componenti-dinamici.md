# 08 — Componenti dinamici (ViewContainerRef + createComponent)

> **Tempo:** ~30 min · **Slide:** TBD · **Blocco:** G1 Sessione 3 · 12:30–13:00 (Mod 1b)

---

## Il problema

Tutta la composizione vista finora (Mod 0 + Schede 06–07) è **statica**: l'host scrive
`<app-product-quick-view [product]="p" />` nel template e Angular costruisce il
componente al render. Va benissimo quando l'host **sa** in anticipo *quale* componente
servirà *dove*.

Ci sono però scenari in cui questa premessa cade:

- **Overlay/modal/toast** che appaiono in risposta a un evento dell'utente: l'host non
  vuole renderizzare l'overlay finché non serve, né tenerlo "spento" con `@if`.
- **Componenti a contenuto deciso a runtime**: una dashboard sceglie il widget da mostrare
  in funzione della configurazione utente; il template non sa in anticipo *quale* classe
  componente serve.
- **Plug-in/estensioni**: una libreria espone una "slot zone" dove altri pezzi di codice
  iniettano componenti che la libreria non conosce.

Per questi casi Angular offre l'**istanziazione dinamica**: un punto di ancoraggio nel DOM
(`ViewContainerRef`) e un'API per crearci dentro un componente standalone
(`createComponent`). Dal Lab 1 lo useremo per la `ProductQuickView`.

---

## `ViewContainerRef` — il punto di ancoraggio

Un `ViewContainerRef` è un "appiglio" dentro al DOM dove Angular può **montare** una view
(template o componente). Due modi pratici di ottenerne uno nel componente host:

### (a) Iniettarlo nel componente padre

```typescript
@Component({ /* ... */ })
export class HomePage {
  private vcr = inject(ViewContainerRef);
  // il componente verrà montato come "sibling" del componente HomePage
}
```

Comodo per overlay/toast: il componente dinamico nasce nello stesso punto del DOM dove
vive l'host.

### (b) `viewChild` con `{ read: ViewContainerRef }` su un'ancora del template

```typescript
@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div class="grid grid-cols-3 gap-4">
      @for (p of products(); track p.id) {
        <app-product-card [product]="p" (preview)="openQuickView(p)" />
      }
    </div>

    <!-- ancora invisibile dove monteremo la quick-view -->
    <ng-container #quickViewAnchor></ng-container>
  `,
})
export class HomePage {
  // ottenere il ViewContainerRef ancorato all'ng-container
  anchor = viewChild('quickViewAnchor', { read: ViewContainerRef });

  // ...
}
```

`{ read: ViewContainerRef }` dice ad Angular: "non darmi l'elemento, dammi il
`ViewContainerRef` corrispondente". Senza `read:` riceveresti un `ElementRef`.

> **Quando preferire l'una o l'altra:** (a) per overlay che vivono "globalmente" rispetto
> al template; (b) quando il punto di montaggio è preciso e si vede nel template — più
> esplicito e più facile da leggere per uno studente che legge il codice del corso.

---

## `createComponent` — la stessa firma di Angular 14+

```typescript
import { ProductQuickView } from '../product-quick-view/product-quick-view';

openQuickView(p: Product): void {
  const vcr = this.anchor();
  if (!vcr) return;             // l'ancora non è ancora pronta (è un signal)

  const ref = vcr.createComponent(ProductQuickView);  // ← niente factory resolver
  ref.setInput('product', p);

  // tenere il riferimento per chiuderlo
  this.currentQuickView = ref;
}
```

Tre cose da memorizzare:

| Punto | Dettaglio |
|---|---|
| **No `ComponentFactoryResolver`** | È stato deprecato in Angular 14+; il vecchio codice "factory" non serve più |
| **`createComponent(C)`** | accetta direttamente la classe del componente. **C deve essere standalone** |
| **`setInput(name, value)`** | il modo corretto per impostare gli `@Input()` del componente dinamico (Angular 14+); attiva binding e CD coerenti |

Lo *standalone* è obbligatorio perché Angular non sa in che `NgModule` cercare il
componente: la classe deve dichiarare i propri `imports`.

---

## Passare dati e ascoltare eventi

### Input → `setInput`

```typescript
ref.setInput('product', p);                 // imposta product
ref.setInput('zoom', 1.5);                  // più di uno, semplicemente più chiamate
```

`setInput` accetta **solo nomi di input pubblici** del componente. Se il componente espone
un signal input (`product = input<Product>()`), la stessa API funziona.

### Output → `.instance.<output>.subscribe(...)`

Gli `@Output()` (`EventEmitter`) sono raggiungibili tramite `ref.instance`:

```typescript
ref.instance.close.subscribe(() => {
  ref.destroy();
  this.currentQuickView = undefined;
});
```

**Attenzione al cleanup**: ti sei sottoscritto a un `EventEmitter`. Quando distruggi il
componente con `ref.destroy()`, Angular completa l'emitter e la subscription si chiude
da sola — **a patto che tu chiami `destroy()`**. Se ti dimentichi, l'host conserva la
subscription e il componente non viene smontato.

---

## Cleanup — la riga che gli studenti dimenticano

```typescript
ref.destroy();              // distrugge il componente + DOM + tutte le sue subscription
// OPPURE
vcr.clear();                // rimuove TUTTE le view montate in questo ViewContainerRef
```

Tre regole pratiche:

1. **Per ogni `createComponent` ci deve essere un `destroy`** (o un `clear()` del
   container che lo conteneva).
2. **Quando l'host viene distrutto**, Angular distrugge anche le view montate nel suo
   `ViewContainerRef`. Ma non aspettare: se l'utente apre la quick-view 30 volte senza
   distruggerla, ti porti dietro 30 componenti orfani con i loro listener e
   `ProductService` che li tiene in vita.
3. **Stato pulito al riapri**: se la stessa anchor può ospitare un solo componente alla
   volta, prima di `createComponent` chiama `vcr.clear()` per essere sicuro di non
   accumulare.

Pattern compatto del Lab 1:

```typescript
openQuickView(p: Product): void {
  const vcr = this.anchor();
  if (!vcr) return;
  vcr.clear();                                    // pulizia preventiva
  const ref = vcr.createComponent(ProductQuickView);
  ref.setInput('product', p);
  ref.instance.close.subscribe(() => vcr.clear()); // close → smontaggio
}
```

---

## `ngTemplateOutlet` vs componente dinamico

Sembrano alternative, ma risolvono problemi diversi:

| Cosa stai montando? | Strumento |
|---|---|
| Un **template** del padre (con dati che il padre ha) | `<ng-template>` + `ngTemplateOutlet` (Scheda 07) |
| Un **componente** con la sua classe, il suo stato, il suo change detection, i suoi servizi iniettati | `ViewContainerRef.createComponent` (questa scheda) |

Caso pratico del corso: la `ProductCard` accetta un `<ng-template>` per il badge
(parametrizzato sui dati della card) **ma** la quick-view è un **componente** con stato
proprio (chiusura, animazioni, eventuale lazy-load di immagini). Mestieri diversi.

---

## Errori comuni

### 1. Provare a montare un componente non standalone

```typescript
vcr.createComponent(LegacyComponent);
// Error: The component class is not standalone
```

**Fix:** aggiungere `standalone: true` al `@Component` (e `imports: [...]` con le sue
dipendenze). In Angular 21 è il default — ma se stai integrando codice vecchio, controlla.

### 2. Dimenticare `setInput` e impostare `instance.foo = ...`

```typescript
ref.instance.product = p;     // ❌ bypassa il CD, valori "non visti" dal template
ref.setInput('product', p);   // ✅ via ufficiale
```

A volte funziona "per fortuna" se l'input è una primitiva, poi un giorno smette con un
oggetto. Usare sempre `setInput`.

### 3. Niente `destroy`

Sintomo classico: aprire/chiudere la quick-view 20 volte e poi vedere che `console.log`
di ogni nuova istanza non si pulisce, e che la rete viene chiamata in continuazione. Apri
i DevTools → Performance → contatore di componenti → cresce monotonamente.

**Fix:** `ref.destroy()` o `vcr.clear()` (vedi pattern compatto sopra).

### 4. Usare il vecchio `ComponentFactoryResolver`

```typescript
const factory = this.cfr.resolveComponentFactory(QuickView); // ❌ deprecato
const ref = this.vcr.createComponent(factory);
```

Funziona ancora ma è marcato **deprecated** dal 2022 (Angular 14). Sostituire con
`vcr.createComponent(QuickView)`.

### 5. `viewChild()` non ancora pronto

```typescript
ngOnInit() {
  this.anchor()?.createComponent(...); // ❌ viewChild è disponibile dopo init delle view
}
```

`viewChild` ritorna un signal `Signal<T | undefined>`. Nei lifecycle precoci (`ngOnInit`)
la view non è ancora costruita → ritorna `undefined`. Chiamare `createComponent` dentro
un **handler utente** (es. `(click)`) o in `afterNextRender` se serve subito al primo
ciclo.

---

## Schema riassuntivo

```
                 HOST (HomePage)
                 ┌───────────────────────────────────────┐
                 │ private vcr =                         │
                 │   viewChild('anchor',                 │
                 │             { read: ViewContainerRef});│
                 │                                       │
                 │ openQuickView(p) {                    │
                 │   const ref = this.vcr().createComponent(ProductQuickView);
                 │   ref.setInput('product', p);         │
                 │   ref.instance.close.subscribe(       │
                 │     () => ref.destroy());             │
                 │ }                                     │
                 └───────────────────────────────────────┘
                              │
                              ▼ <ng-container #anchor>
                       ┌─────────────────┐
                       │ ProductQuickView│  ← standalone, riceve @Input product,
                       │ (componente)    │     emette @Output close
                       └─────────────────┘
```

| Voce | Sintassi chiave |
|---|---|
| Anchor nel template | `<ng-container #anchor></ng-container>` |
| Ottenere il `ViewContainerRef` | `viewChild('anchor', { read: ViewContainerRef })` (oppure `inject(ViewContainerRef)` sull'host) |
| Creare il componente | `vcr.createComponent(MyStandaloneComp)` |
| Impostare un input | `ref.setInput('nome', valore)` |
| Ascoltare un output | `ref.instance.eventName.subscribe(...)` |
| Distruggere singolo componente | `ref.destroy()` |
| Distruggere tutti i componenti dell'anchor | `vcr.clear()` |
| Requisito | il componente target è **standalone** |

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| — | Nessun file del seme usa `ViewContainerRef.createComponent`: è la **novità** del Mod 1b. Verrà introdotta nel Lab 1 con `ProductQuickView`. |

---

## Prossimo: [09 — Host Directives](./09-host-directives.md)
