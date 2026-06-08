# 07 — ng-template + ngTemplateOutlet

> **Tempo:** ~30 min · **Slide:** TBD · **Blocco:** G1 Sessione 3 · 12:00–12:30 (completamento Mod 1a)

---

## Il problema

La Scheda 06 ci ha dato la projection multi-slot: il padre **spinge** del DOM nel figlio
e il figlio lo "smista" coi selettori. Funziona finché il padre conosce in anticipo *quale*
markup serve in *quale* posto.

Tre limiti rimangono:

- **Stesso markup, montato più volte.** Non si proietta lo stesso `<ng-content>` in due
  punti del template figlio: il nodo viene "consumato" dal primo slot (errore comune n.3
  della Scheda 06).
- **Markup che dipende dai dati interni del figlio.** Il padre vorrebbe scrivere "per
  ogni prodotto della lista del figlio, mostra X" — ma quei prodotti sono dentro al figlio,
  non al padre.
- **Markup parametrico.** Il padre vorrebbe un "ricettario" di template (header, body,
  footer) da richiamare al momento giusto, con parametri.

`<ng-template>` + `ngTemplateOutlet` rispondono a tutti e tre: il padre dichiara un
**frammento di template** con dei "buchi" (le variabili di contesto), il figlio lo
**monta** quando vuole e dove vuole, passandogli i dati che servono.

---

## `<ng-template>` — un frammento che non si renderizza da solo

```html
<!-- Da qualche parte nel template del padre -->
<ng-template #saluto>
  <p class="text-teal-700">Ciao a tutti!</p>
</ng-template>
```

Tre cose da notare:

1. **Non si vede a video.** `<ng-template>` è "spento" finché qualcuno non lo monta. È
   come una funzione: dichiararla non la esegue.
2. **`#saluto`** è una *reference variable* — l'etichetta per richiamarlo nel resto del
   template.
3. **Niente magia con `*ngIf`/`*ngFor` ecc.** Tutte le direttive strutturali in realtà
   creano un `<ng-template>` "implicito" sotto il cofano. `<ng-template>` esplicito è
   quello che ti serve quando vuoi controllo manuale.

---

## `ngTemplateOutlet` — monta il template dove vuoi

Per "accenderlo" si usa la direttiva `*ngTemplateOutlet`, di solito su un
`<ng-container>` (un elemento che non genera DOM proprio):

```html
<ng-template #saluto>
  <p class="text-teal-700">Ciao a tutti!</p>
</ng-template>

<!-- ↓ qui appare il saluto -->
<ng-container *ngTemplateOutlet="saluto"></ng-container>

<!-- ↓ e qui di nuovo — stesso template, montato due volte -->
<ng-container *ngTemplateOutlet="saluto"></ng-container>
```

Il template `#saluto` viene "stampato" in entrambi i punti. **Nessuna duplicazione di
codice**, due render reali. Questo da solo già risolve il primo limite del Mod 1a (stesso
markup, più posti).

---

## Context: passare dati al template

La parte più potente: ogni template può accettare un **oggetto di contesto** e dichiarare
delle variabili che leggono i campi di quel contesto.

```html
<ng-template #riga let-prodotto let-i="indice">
  <li>
    {{ i + 1 }}. <strong>{{ prodotto.name }}</strong> — {{ prodotto.price | currency }}
  </li>
</ng-template>

<ul>
  <ng-container
    *ngTemplateOutlet="riga; context: { $implicit: products[0], indice: 0 }">
  </ng-container>
  <ng-container
    *ngTemplateOutlet="riga; context: { $implicit: products[1], indice: 1 }">
  </ng-container>
</ul>
```

Tre cose da memorizzare:

| Sintassi | Significato |
|---|---|
| `let-prodotto` | dichiara una variabile `prodotto` che legge la chiave **`$implicit`** del contesto |
| `let-i="indice"` | dichiara `i` che legge la chiave **`indice`** del contesto |
| `context: { $implicit: …, indice: … }` | oggetto passato al template per il render |

`$implicit` è una **convenzione**: la chiave "principale" del contesto, quella per cui
basta scrivere `let-prodotto` senza specificare la chiave. Le altre vanno mappate
esplicitamente con `let-i="indice"`.

> Se conosci una direttiva strutturale come `*ngFor`, hai già visto questo pattern:
> `*ngFor="let p of products; let i = index"` è esattamente lo stesso meccanismo.
> `*ngTemplateOutlet` lo rende "manuale".

---

## Da TypeScript: ottenere il `TemplateRef`

Spesso il template viene **passato come `@Input()`** a un componente figlio, che poi
decide quando e come montarlo. Per questo serve un **riferimento tipizzato** al template:
`TemplateRef<TContext>`.

### Stile moderno (consigliato in Angular 21): `viewChild()` signal

```typescript
// estratto di un FancyCard didattico — non riscriviamo il seme
import { Component, TemplateRef, viewChild, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-fancy-card',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="rounded-xl shadow-md border p-4">
      <header class="mb-3">
        <ng-container
          *ngTemplateOutlet="headerTpl(); context: { $implicit: title() }">
        </ng-container>
      </header>
      <main><ng-content /></main>
    </div>
  `,
})
export class FancyCard {
  title = signal('Catalogo prodotti');

  // ✅ viewChild signal — restituisce TemplateRef<any> | undefined
  headerTpl = viewChild<TemplateRef<any>>('headerTpl');
}
```

### Stile decoratore (ancora valido): `@ViewChild`

```typescript
@ViewChild('headerTpl', { static: false })
headerTpl!: TemplateRef<any>;
```

Le due forme sono equivalenti per il caso d'uso del template ref. Nel corso preferiamo
`viewChild()` perché si integra con i signal e non richiede `static: true/false`
(domanda ricorrente in aula su `@ViewChild`).

---

## Stesso problema, due strumenti: `<ng-content>` vs `<ng-template>`

Quando si sovrappongono? Mai del tutto: hanno scopi diversi.

| Scenario | Soluzione |
|---|---|
| Il padre passa **DOM statico** che il figlio inserisce in punti predefiniti | `<ng-content select="...">` (Scheda 06) |
| Il padre passa **markup parametrico**, da renderizzare 0/1/N volte con dati che il figlio conosce | `<ng-template>` + `ngTemplateOutlet` |
| Il padre passa **dati semplici** (testo, numero, booleano) | `@Input()` |
| Il figlio dichiara un template e lo monta in più punti del suo stesso template | `<ng-template>` interno + `ngTemplateOutlet` |

Esempio concreto del corso (anteprima del **Lab 1**): la `ProductCard` accetta un
`@Input() badgeTemplate?: TemplateRef<Product>` opzionale. Se l'host glielo passa, la
card lo monta con il prodotto come `$implicit`; se non glielo passa, mostra un badge di
default. Il vantaggio: **lo stesso markup di badge** può essere usato dall'host in 30
schede prodotto, parametrizzato sui dati di ognuna.

---

## Errori comuni

### 1. Dimenticare `NgTemplateOutlet` negli `imports`

```typescript
// ❌ standalone component senza NgTemplateOutlet → "Can't bind to 'ngTemplateOutlet' since it isn't a known property of 'ng-container'"
@Component({ imports: [], template: '...' })
```

`*ngTemplateOutlet` non è control flow built-in (non è `@if`/`@for`): vive in
`@angular/common`. Aggiungilo:

```typescript
import { NgTemplateOutlet } from '@angular/common';
@Component({ imports: [NgTemplateOutlet], ... })
```

### 2. Dimenticare l'asterisco `*`

```html
<!-- ❌ non funziona: ngTemplateOutlet senza asterisco viene letto come "proprietà ngTemplateOutlet su un div" -->
<div ngTemplateOutlet="tpl"></div>

<!-- ✅ asterisco = direttiva strutturale -->
<ng-container *ngTemplateOutlet="tpl"></ng-container>
```

Forma alternativa esplicita (raramente usata): `<ng-template [ngTemplateOutlet]="tpl">`.

### 3. Context con chiavi sbagliate

```html
<ng-template #riga let-prodotto>...</ng-template>

<ng-container *ngTemplateOutlet="riga; context: { item: p }"></ng-container>
                                       <!-- ❌ chiave "item", ma let-prodotto cerca $implicit -->
```

A runtime: nessun errore, `prodotto` resta `undefined`. La griglia si mostra ma con
campi vuoti.

**Fix:** allinea le chiavi: `context: { $implicit: p }` per le variabili dichiarate con
`let-x` senza chiave, e nome esplicito per le altre (`context: { $implicit: p, indice: i }`).

### 4. Usare `<ng-template>` quando bastava `@if`

```html
<!-- ❌ Sovra-ingegneria: un placeholder banale -->
<ng-template #vuoto><p>Nessun prodotto.</p></ng-template>
<ng-container *ngTemplateOutlet="products.length === 0 ? vuoto : null"></ng-container>

<!-- ✅ Control flow built-in -->
@if (products.length === 0) {
  <p>Nessun prodotto.</p>
}
```

Lo strumento giusto per "mostra A oppure B in funzione di una condizione" è il control
flow integrato. `<ng-template>` + `ngTemplateOutlet` brillano quando lo **stesso**
template va montato in più punti o quando il template è **passato dall'esterno**.

---

## Schema riassuntivo

```
                  PADRE
                  ┌─────────────────────────────────────┐
                  │ <ng-template #riga                  │
                  │   let-p let-i="idx">                │  ← template "dormiente"
                  │   {{ i+1 }}. {{ p.name }}           │
                  │ </ng-template>                      │
                  │                                     │
                  │ <ng-container *ngTemplateOutlet=    │  ← monta + passa context
                  │   "riga;                            │
                  │    context: { $implicit: p, idx:i}" │
                  │ />                                  │
                  └─────────────────────────────────────┘
                                  │
                                  │ "stampa" il template
                                  ▼
                       1. Carrello — Tazza  €5
```

| Voce | Sintassi chiave |
|---|---|
| Dichiarare un template | `<ng-template #ref> ... </ng-template>` |
| Variabile di contesto principale | `let-p` (legge `$implicit`) |
| Variabile di contesto secondaria | `let-i="indice"` |
| Montare il template | `<ng-container *ngTemplateOutlet="ref">` |
| Montare con dati | `*ngTemplateOutlet="ref; context: { $implicit: p, indice: i }"` |
| Ottenere il TemplateRef da TS | `viewChild<TemplateRef<any>>('ref')` |
| Import necessario | `NgTemplateOutlet` da `@angular/common` |

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/components/card-container/card-container.ts`](../../progetto/product-catalog/src/app/components/card-container/card-container.ts) | Il punto di partenza concettuale: un componente con `<ng-content>` singolo che, nel Lab 1, evolveremo aggiungendo anche un `<ng-template>` passato dall'host |

> Nessun altro file del seme usa `ngTemplateOutlet` direttamente: è la **novità** che
> introduciamo in Mod 1a e applicheremo nel Lab 1 alla `ProductCard`.

---

## Prossimo: [08 — Componenti dinamici (ViewContainerRef + createComponent)](./08-componenti-dinamici.md)
