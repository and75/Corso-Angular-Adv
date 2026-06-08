# 06 — ng-content multi-slot

> **Tempo:** ~30 min · **Slide:** TBD · **Blocco:** G1 Sessione 3 · 11:30–12:00 (Mod 1a)

---

## Il problema

Nel Mod 0 abbiamo visto `<ng-content>` con un **solo foro**: il `CardContainer` del seme
prende il `title` come `@Input()` e proietta qualsiasi contenuto figlio nel suo corpo
(Scheda 05). Funziona finché il componente ha **una sola** area variabile.

Per i componenti veri di un design system — card, accordion, dialog, toolbar — un solo
slot non basta: vogliamo che l'host scelga separatamente **header**, **corpo** e **footer**,
o nel caso di una `ProductCard` un **badge** opzionale, il **body** principale e un **footer**
con il pulsante azione.

Questa scheda risponde a tre domande:
1. Come si dichiarano più `<ng-content>` nello stesso componente senza che si calpestino.
2. Cosa succede se uno slot resta vuoto e come dare un default.
3. Quando conviene proiettare DOM (ng-content) e quando conviene passare un dato (`@Input()`).

---

## Richiamo: slot singolo (Scheda 05)

Il punto di partenza è già nel seme:

```typescript
// src/app/components/card-container/card-container.ts — codice reale del seme
@Component({
  selector: 'app-card-container',
  imports: [],
  templateUrl: './card-container.html',
})
export class CardContainer {
  @Input() title: string = '';
  @Input() variant: 'default' | 'success' | 'warning' | 'info' = 'default';
}
```

```html
<!-- src/app/components/card-container/card-container.html — codice reale del seme -->
<div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

  @if (title) {
    <div [class]="'px-4 py-3 ' + headerClass">
      <h3 class="font-semibold text-sm">{{ title }}</h3>
    </div>
  }

  <div class="p-4">
    <ng-content></ng-content>      <!-- ← UN solo foro, riceve tutto il contenuto del padre -->
  </div>

</div>
```

Tutto il contenuto del padre — qualunque sia — finisce dentro al `<ng-content>`. L'unica
parte "configurabile a parte" è il `title`, che però è un **dato testuale**, non una porzione
di DOM.

---

## Multi-slot: ogni `<ng-content>` con il suo selettore

Per "spezzare" il contenuto del padre in più pezzi, ogni `<ng-content>` riceve un
**attributo `select`** che funziona come un selettore CSS:

```html
<!-- Versione "evoluta" del card-container, didattica — non riscriviamo il seme,
     ma è il modello che applicheremo nel Lab 1 alla ProductCard -->
<div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">

  <!-- SLOT 1: header (tutto ciò che il padre marca con [header]) -->
  <div class="px-4 py-3 bg-gray-50 border-b">
    <ng-content select="[header]">
      <!-- contenuto DI DEFAULT se l'host non passa nessun [header] -->
      <h3 class="font-semibold text-sm text-gray-400">Card</h3>
    </ng-content>
  </div>

  <!-- SLOT 2: body (default: tutto ciò che non ha matchato gli altri selettori) -->
  <div class="p-4">
    <ng-content></ng-content>
  </div>

  <!-- SLOT 3: footer -->
  <div class="px-4 py-3 bg-gray-50 border-t">
    <ng-content select="[footer]"></ng-content>
  </div>

</div>
```

Uso dal padre:

```html
<app-card-container>
  <h3 header>Catalogo prodotti</h3>     <!-- → SLOT 1 -->

  <p>Lista dei 9 prodotti attualmente disponibili.</p>
  <ul>…</ul>                              <!-- → SLOT 2 (default) -->

  <button footer>Aggiorna</button>      <!-- → SLOT 3 -->
</app-card-container>
```

Tre cose da notare a colpo d'occhio:

| Aspetto | Come funziona |
|---|---|
| **Selettore** | sintassi CSS: `[header]` (attributo), `.header` (classe), `app-toolbar` (componente/tag) |
| **Match** | ogni nodo figlio viene "smistato" nel **primo** `<ng-content select="...">` che matcha; quello senza `select` cattura il **resto** |
| **Fallback** | il contenuto **dentro** a `<ng-content>` è il default usato quando lo slot resta vuoto |

> **Da Mod 1a in poi:** scriviamo il selettore prima del contenuto. Se nel template del
> *consumer* non vedete un attributo come `header`/`footer`, è solo perché Angular non vi
> obbliga a "= valore": stiamo sfruttando il selettore CSS `[attr]` su un attributo senza
> valore.

---

## Tipi di selettore — quale scegliere

Un componente del design system può scegliere tre stili. Tutti validi, **conviene tenerne
uno solo** per coerenza:

```html
<!-- (a) Attributo (consigliato) — leggibile e non collide con CSS reale -->
<ng-content select="[header]"></ng-content>
<ng-content select="[footer]"></ng-content>

<!-- (b) Classe — utile se gli host vogliono comunque applicare quella classe -->
<ng-content select=".card-header"></ng-content>

<!-- (c) Component/tag selector — quando il pezzo è già un componente Angular dedicato -->
<ng-content select="app-card-actions"></ng-content>
```

Nel **Lab 1**, sulla `ProductCard`, useremo lo stile (a): `<ng-content select="[badge]">`
e `<ng-content select="[footer]">`. È quello che lascia il template del consumer più pulito
e leggibile.

---

## Contenuto di default (fallback)

Tutto ciò che scrivi **dentro** a `<ng-content>` è il "valore di riserva":

```html
<ng-content select="[header]">
  <h3 class="font-semibold text-sm text-gray-400">Card</h3>
</ng-content>
```

Se l'host **non** proietta nessun nodo con attributo `header`, viene mostrato l'`<h3>` grigio.
Se invece passa qualcosa, il fallback **sparisce** completamente — niente sovrapposizioni.

Utile per:
- pulsanti di azione di default ("Annulla / OK") personalizzabili a piacere;
- "empty state" di una tabella o lista;
- icone segnaposto.

---

## Quando projection, quando `@Input()`

È la domanda che gli studenti fanno di più. La regola del corso:

| Stai passando… | Usa |
|---|---|
| Un **testo / numero / valore** | `@Input()` (es. `title`, `variant`) |
| Un **flag** che decide se mostrare qualcosa | `@Input() boolean` con `@if` nel template del figlio |
| Una porzione di **DOM/markup** statica | `<ng-content>` (con o senza `select`) |
| Una porzione di markup che dipende da **dati interni** del figlio | `<ng-template>` + `ngTemplateOutlet` (Scheda 07) |

`CardContainer` è un esempio perfetto del mix: `title` è un dato (`@Input()`), il corpo è
DOM proiettato (`<ng-content>`). Le due cose **convivono** senza calpestarsi.

---

## Errori comuni

### 1. Selettore che non matcha → nodo "perso"

```html
<!-- componente -->
<ng-content select="[header]"></ng-content>
<ng-content></ng-content>

<!-- host -->
<app-card-container>
  <h3 class="header">Titolo</h3>   <!-- ❌ il selettore è [header], non .header -->
</app-card-container>
```

Cosa succede: il nodo `<h3>` non matcha `[header]`, quindi finisce nello slot **default** —
e nel header dell'header bar resta vuoto. Niente errore a runtime, niente warning: lo si
nota solo a video.

**Fix:** usare un attributo (`<h3 header>Titolo</h3>`) coerente col selettore.

### 2. Ordine inverso dei selettori

```html
<!-- componente — ❌ default prima dei selettori specifici -->
<ng-content></ng-content>
<ng-content select="[footer]"></ng-content>
```

Il primo `<ng-content>` (default) ha la precedenza e **cattura tutto**, footer incluso —
il `<ng-content select="[footer]">` resta vuoto.

**Fix:** mettere sempre lo slot **default senza `select`** per ultimo, oppure non confidare
sull'ordine e usare selettori espliciti per tutti.

### 3. `<ng-content>` multipli con lo stesso selettore

```html
<ng-content select="[footer]"></ng-content>
<!-- ... -->
<ng-content select="[footer]"></ng-content>   <!-- ❌ duplicato -->
```

Il nodo proiettato dall'host **non si duplica**: viene "consumato" dal primo slot e il
secondo resta vuoto. Pattern raro ma confonde se cercavi di renderizzare lo stesso pezzo in
due posti — quello è il caso di `<ng-template>` + `ngTemplateOutlet` (Scheda 07).

### 4. Selettore "troppo largo"

```html
<ng-content select="div"></ng-content>
```

Cattura **qualsiasi** `<div>` proiettato, incluso roba che volevi nel default. Preferire
sempre selettori intenzionali (`[attr]` o tag dedicati).

---

## Schema riassuntivo

```
                  HOST (consumer)
                  ┌─────────────────────────────────────┐
                  │ <app-card-container>                │
                  │   <h3 header>Titolo</h3>            │  ──┐
                  │   <p>Body…</p>                      │  ──┤── proiezione
                  │   <button footer>OK</button>        │  ──┘
                  │ </app-card-container>               │
                  └─────────────────────────────────────┘
                              │
                              ▼ smistamento per selettore
   COMPONENTE (CardContainer)
   ┌─────────────────────────────────────────────────────┐
   │ <ng-content select="[header]">     ← <h3 header>   │
   │ <ng-content>                       ← <p> (default) │
   │ <ng-content select="[footer]">     ← <button>      │
   └─────────────────────────────────────────────────────┘
```

| Voce | Sintassi chiave |
|---|---|
| Slot singolo (Mod 0) | `<ng-content></ng-content>` |
| Slot con selettore | `<ng-content select="[attr]"></ng-content>` |
| Default per il resto | `<ng-content></ng-content>` (di solito **per ultimo**) |
| Fallback se vuoto | contenuto **dentro** a `<ng-content>...</ng-content>` |
| Quando preferire `@Input()` | passi un dato (non DOM) |
| Quando passare a `<ng-template>` | il pezzo dipende da dati interni del figlio (Scheda 07) |

### File reali nel seme da citare in aula

| File | Cosa mostra |
|---|---|
| [`src/app/components/card-container/card-container.ts`](../../progetto/product-catalog/src/app/components/card-container/card-container.ts) | Slot singolo + `@Input() title`/`variant` come punto di partenza |
| [`src/app/components/card-container/card-container.html`](../../progetto/product-catalog/src/app/components/card-container/card-container.html) | L'`<ng-content>` singolo che evolveremo nel Lab 1 |

---

## Prossimo: [07 — ng-template + ngTemplateOutlet](./07-ngtemplate-outlet.md)
