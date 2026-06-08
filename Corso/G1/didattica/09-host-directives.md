# 09 — Host Directives

> **Tempo:** ~30 min · **Slide:** TBD · **Blocco:** G1 Sessione 4 · 14:00–14:30 (completamento Mod 1b)

---

## Il problema

Nel seme c'è `HighlightDirective`: un attribute directive che disegna un outline al
`mouseenter` e lo rimuove al `mouseleave`. Per usarla, l'host deve scriverla
**esplicitamente** ogni volta:

```html
<!-- estratto di un template tipico nel seme -->
<div appHighlight highlightColor="teal">…</div>
<div appHighlight highlightColor="teal">…</div>
<div appHighlight highlightColor="teal">…</div>
```

Va bene per pattern occasionali. Diventa un problema quando il comportamento è
**parte dell'identità** di un componente: la `ProductCard` deve **sempre** evidenziarsi
al passaggio, sempre con lo stesso colore, sempre col focus-ring per l'accessibilità.
Ripetere `appHighlight` ovunque significa:

- delegare al consumer un dettaglio che dovrebbe essere "automatico";
- rischiare di dimenticarlo (regressione silenziosa);
- duplicare l'API (input/output della direttiva da passare ovunque).

La soluzione storica era **l'ereditarietà** (`extends`). Funziona ma porta tutti i
problemi noti dell'ereditarietà: gerarchie rigide, override implicit, costruttori
incatenati.

Dalla **Angular 15** esiste un meccanismo migliore: dichiarare nel componente che esso
**ospita** una o più direttive. Si chiamano **host directives** ed è composizione, non
ereditarietà.

---

## Sintassi base

```typescript
import { Component } from '@angular/core';
import { HighlightDirective } from '../../directives/highlight';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [/* ... */],
  hostDirectives: [HighlightDirective],   // ← qui
  templateUrl: './product-card.html',
})
export class ProductCard { /* ... */ }
```

A questo punto, **ogni volta** che un `<app-product-card>` finisce in un template,
Angular monta in automatico anche una `HighlightDirective` sull'host del componente —
il consumer non deve fare nulla.

```html
<!-- Per il consumer è solo: -->
<app-product-card [product]="p" />

<!-- Sotto il cofano è:
     <app-product-card [product]="p" appHighlight>     ← invisibile al consumer
-->
```

> **Vincolo formale:** la direttiva citata in `hostDirectives` deve essere
> **standalone** (`standalone: true`). Nel seme `HighlightDirective` lo è già — Scheda 01.

---

## Forma estesa: esporre input/output

Spesso vuoi che il consumer continui a controllare *qualcosa* della direttiva (es. il
colore del bordo) senza dover sapere che esiste una host directive. Si dichiara la forma
estesa con `inputs` e `outputs`:

```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  hostDirectives: [{
    directive: HighlightDirective,
    inputs: ['highlightColor'],     // ← rendi visibile l'input della direttiva sull'host
    outputs: [],
  }],
  templateUrl: './product-card.html',
})
export class ProductCard { /* ... */ }
```

E nel template del consumer:

```html
<app-product-card [product]="p" highlightColor="emerald" />
```

Il consumer scrive `highlightColor` come se fosse un `@Input()` del `ProductCard`. È un
**alias**: la card non lo gestisce, lo passa direttamente alla `HighlightDirective`
ospitata.

### Rinominare in fase di esposizione

Se vuoi cambiare il nome esposto (per coerenza con l'API del componente):

```typescript
hostDirectives: [{
  directive: HighlightDirective,
  inputs: ['highlightColor: hoverColor'],   // direttiva.highlightColor → host.hoverColor
}]
```

```html
<app-product-card [product]="p" hoverColor="emerald" />
```

Stessa sintassi per `outputs`: `outputs: ['nameInternal: nameExposed']`.

> **Cosa NON è esposto:** se non lo metti in `inputs`/`outputs`, il consumer **non**
> vede l'input/output della direttiva. Per chi guarda il template è invisibile —
> *features* deciso dal componente.

---

## DI condivisa

L'host directive condivide l'**injector** del componente che la ospita. In pratica:

- la direttiva può iniettare ciò che il componente vede (servizi `providedIn: 'root'`,
  ma anche `providers` locali del componente);
- il componente può iniettare l'istanza della direttiva con `inject(HighlightDirective)`
  se gli serve coordinarsi (raramente — meglio passare via input).

Esempio: una `FocusRingDirective` che usa `inject(AccessibilityService)` per leggere la
preferenza utente "ridotto movimento" e disattivare l'animazione. La direttiva non sa
nulla del componente che la ospita; il componente non sa nulla del servizio di
accessibilità. Composizione pulita.

---

## Più host directives, con priorità

`hostDirectives` accetta un array. Esempio realistico per una `ProductCard` "premium":

```typescript
hostDirectives: [
  { directive: HighlightDirective, inputs: ['highlightColor: hoverColor'] },
  { directive: FocusRingDirective },
  { directive: AnalyticsClickDirective, outputs: ['fired: tracked'] },
]
```

L'**ordine** dell'array determina l'ordine di inizializzazione. Non è quasi mai un
problema, ma vale la pena ricordarlo quando una direttiva legge lo stato lasciato da
un'altra.

---

## Stessa direttiva, due modi di applicarla

Confrontare gli stili lato consumer:

### (A) Attribute directive classica — il consumer la attacca

```html
<div appHighlight highlightColor="teal">
  <app-product-card [product]="p" />
</div>
```

Pro: granulare, applicabile a qualsiasi elemento; il consumer ha visibilità totale.
Contro: ripetizione, regressioni silenziose, API duplicata.

### (B) Host directive — il componente la incorpora

```html
<app-product-card [product]="p" hoverColor="teal" />
```

Pro: il comportamento è "baked-in" nel componente; il consumer scrive meno; l'API
esposta è quella del componente.
Contro: il consumer non può **togliere** la direttiva, può solo (se l'`Input` è esposto)
neutralizzarla via valore (es. `hoverColor="transparent"`).

Regola del corso: se la direttiva esprime un'identità del componente (focus ring,
analytics, drag handle del componente), passa a **host directive**. Se è un effetto
collaterale che il consumer applica selettivamente, lasciala **attribute classica**.

---

## Errori comuni

### 1. Direttiva non standalone

```typescript
@Directive({ selector: '[appHighlight]' /* manca standalone: true */ })
export class HighlightDirective { /* ... */ }

@Component({ hostDirectives: [HighlightDirective] })  // ❌ runtime error
```

Sintomo: `NG3001: Host directives must be standalone`. Fix: `standalone: true` sulla
direttiva.

### 2. Input non esposto, consumer ci scrive sopra

```typescript
hostDirectives: [{ directive: HighlightDirective /* niente inputs */ }]
```

```html
<app-product-card highlightColor="emerald" />  <!-- ❌ ignorato senza warning -->
```

L'input esiste sulla direttiva ma non è esposto sul componente: Angular non lo riconosce
come `Input()` di `ProductCard`. Sintomo: il binding sembra funzionare in TS (se il
componente è permissivo) ma a runtime non passa nulla.
**Fix:** elencare l'input in `inputs: ['highlightColor']`.

### 3. Selettori che si scontrano

Se la host directive usa lo stesso selettore di un attributo che il consumer scrive,
si possono creare doppie istanze:

```html
<!-- HighlightDirective è anche host directive del card -->
<app-product-card [product]="p" appHighlight>
  <!-- ❌ una istanza dalla host directive, una dall'attributo: spesso non è ciò che vuoi -->
</app-product-card>
```

**Fix:** se la direttiva è ormai "incorporata", non scriverla a mano. Oppure usa
selettori distinti per i due ruoli.

### 4. Applicare host directive a una direttiva

`hostDirectives` è un metadato del decoratore `@Component` (e `@Directive`) — funziona
**anche** per direttive. Cosa che gli studenti spesso non sanno:

```typescript
@Directive({
  selector: '[appDraggable]',
  standalone: true,
  hostDirectives: [HighlightDirective],   // ✅ valido
})
export class DraggableDirective { /* ... */ }
```

Caso d'uso: una direttiva "drag" che riusa un'altra direttiva "highlight" per il
feedback visuale. Composizione pura.

### 5. Dimenticare di importare la direttiva

`hostDirectives: [HighlightDirective]` richiede comunque l'**import** della classe in
TypeScript. È un errore stupido ma frequente con `auto-import` distratto degli IDE.

---

## Quando NON usare host directives

Tre casi in cui restare con la direttiva classica come attributo è più chiaro:

- **Il comportamento è opzionale per il consumer.** Se il 90% delle volte la card
  non deve evidenziarsi, esporre `hoverColor` come trigger è sovra-ingegneria; lascia
  che chi vuole l'highlight la attacchi.
- **La direttiva controlla la struttura del DOM** (è una direttiva strutturale o
  modifica pesantemente il template). Host directives sono pensate per behavior sul
  nodo host, non per riscrivere il rendering.
- **Stai integrando codice legacy** che non puoi rendere standalone — quel codice
  resta `extends`/`NgModule` finché non lo migri.

---

## Schema riassuntivo

```
  PRIMA (attribute directive)              DOPO (host directive)
  ─────────────────────────────            ─────────────────────────
  <app-product-card appHighlight           @Component({
    highlightColor="teal" />                 selector: 'app-product-card',
                                             hostDirectives: [{
  • Il consumer ricorda la direttiva.        directive: HighlightDirective,
  • L'API si raddoppia.                      inputs: ['highlightColor: hoverColor'],
  • Regressioni silenziose se               }],
    si dimentica.                          })

                                          <app-product-card hoverColor="teal" />

                                           • Comportamento incorporato.
                                           • Una sola API (quella del componente).
                                           • Il consumer scrive meno e meglio.
```

| Voce | Sintassi chiave |
|---|---|
| Forma semplice | `hostDirectives: [HighlightDirective]` |
| Forma estesa | `hostDirectives: [{ directive, inputs: [...], outputs: [...] }]` |
| Esporre input col nome originale | `inputs: ['highlightColor']` |
| Esporre input col rename | `inputs: ['highlightColor: hoverColor']` |
| Vincolo | la direttiva deve essere `standalone: true` |
| DI condivisa | stesso injector → la direttiva vede gli stessi provider del componente |
| Errore tipico | NG3001 (direttiva non standalone) |

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/directives/highlight.ts`](../../progetto/product-catalog/src/app/directives/highlight.ts) | Direttiva attribute classica già `standalone: true` — candidata perfetta per essere "promossa" a host directive di `ProductCard` |
| [`src/app/components/product-card/product-card.ts`](../../progetto/product-catalog/src/app/components/product-card/product-card.ts) | Possibile host: oggi non usa `HighlightDirective` né direttamente né come host directive |

> Nessun componente del seme usa ancora `hostDirectives`: è il pattern **nuovo** che
> introduciamo qui. La promozione di `HighlightDirective` a host directive di
> `ProductCard` può essere uno degli step del Lab 1 (opzionale o **DIFFICILE**) se il
> tempo lo permette.

---

## Prossimo: [10 — Libreria legacy + NgZone · Subject / BehaviorSubject](./10-legacy-subject.md)
