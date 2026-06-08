# Lab 1 — ProductCard multi-slot + ProductQuickView dinamico
## Guida per il Docente

---

## 1. Scopo Didattico

Primo lab dove gli studenti **mettono insieme** più concetti del Mod 1 in un unico esercizio:

- Projection multi-slot della Scheda 06 → due slot in `ProductCard` (badge + footer) con fallback.
- (Cenno) anteprima del pattern `<ng-template>` + `ngTemplateOutlet` della Scheda 07 — qui non usato, ma menzionato come naturale "passo successivo" se la classe è veloce.
- Componenti dinamici della Scheda 08 → `ViewContainerRef.createComponent(ProductQuickView)` con `setInput`, subscribe a `close`, cleanup con `vcr.clear()`.

L'esercizio è progettato per essere **interamente visivo**: dopo ogni TODO il risultato si vede a video, riducendo la frustrazione "ho scritto codice ma non capisco se funziona".

---

## 2. Timing Consigliato

**Slot orario: 14:30–15:30 (60 minuti)**

| Fase | Attività | Durata |
|---|---|---|
| Intro | Demo del risultato finale (preview sui prodotti premium + click su "Anteprima") | 3 min |
| Parte 1 | TODO 1–3: refactor `ProductCard` con multi-slot + uso da HomePage | 22 min |
| Recap di mezzo | Verifica visiva del badge "Premium" + del pulsante footer | 3 min |
| Parte 2 | TODO 4: creare `ProductQuickView` (component nuovo) | 8 min |
| Parte 2 | TODO 5–6: anchor + viewChild + `openQuickView` con `createComponent`/`setInput`/cleanup | 17 min |
| Verifica finale | Tutti i criteri soddisfatti, no errori console | 5 min |
| Bonus | TODO 7 esplicito `destroyRef.onDestroy` (solo se rimane tempo) | 2 min |
| **Totale** | | **~60 min** |

> Se la classe è veloce e arrivano a fine TODO 6 in 45 min, lancia il TODO 7 e dopo proponi a voce: "come trasformereste il `[badge]` in `<ng-template>` per dare al consumer accesso ai dati del prodotto?" — risposta nella sezione 8.

---

## 3. Contesto nella Scaletta

Questo lab arriva subito dopo la pausa pranzo (14:00–14:30 è Mod 1b host directives — solo teoria). Gli studenti hanno appena ascoltato 30 min sulle host directives e nel lab non le usano direttamente (questione di tempo) — segnalalo:

> "Le host directives le abbiamo viste in teoria. Nel Lab 1 ci concentriamo su projection multi-slot e componenti dinamici perché lo schermo cambia ogni due minuti e si vede. Le host directives le applicherete nel Lab 2 o nei vostri progetti."

Se qualcuno chiede "ma non possiamo applicare `HighlightDirective` come host directive a `ProductCard`?" → "Sì, è il TODO bonus avanzato della Scheda 09. Provatelo a casa, in aula puntiamo a `ProductQuickView`."

---

## 4. Soluzione Commentata — Punti chiave

### 4.1 Slot `[badge]` con fallback default (TODO 1)

Punto sottile da chiarire: il contenuto **dentro** a `<ng-content>` non è "una proposta" — viene mostrato **solo se** lo slot resta vuoto. Quando l'host passa un `<span badge>`, il fallback sparisce completamente.

```html
<ng-content select="[badge]">
  <span class="...">{{ product().category }}</span>   <!-- fallback -->
</ng-content>
```

**Cosa dire:**
> "Pensate al fallback come a un 'comportamento di default'. Card senza badge → vedete la categoria. Card con `[badge]` esplicito → l'host comanda. È il pattern dei design system: dare un comportamento sensato out-of-the-box, ma permettere di personalizzare."

### 4.2 Disaccoppiamento perfetto host ↔ card (TODO 3)

Il pulsante "Anteprima" è dichiarato nel template della **HomePage**, non della `ProductCard`. La card non ha mai sentito parlare di "anteprima". Se domani vogliamo togliere il pulsante dalla home e metterlo in una griglia diversa, la card non cambia.

**Cosa dire:**
> "Avete progettato un componente che non sa cosa gli mettono dentro. È il principio della projection: composizione, non ereditarietà. La card è un guscio, l'host decide il contenuto."

### 4.3 `viewChild` con `{ read: ViewContainerRef }` (TODO 5)

Domanda ricorrente: "perché `{ read }` se l'ancora è già un `<ng-container>`?"

```typescript
viewChild('quickViewAnchor', { read: ViewContainerRef })
```

**Risposta:**
> "Senza `read:`, Angular cerca di darvi l'elemento DOM o l'istanza del componente. Con `read: ViewContainerRef` chiedete esplicitamente il container Angular del nodo. Senza la chiave, su un `<ng-container>` ricevereste un `ElementRef` che non sa creare componenti."

### 4.4 `vcr.clear()` prima di `createComponent` (TODO 6)

Il pattern compatto del corso:

```typescript
vcr.clear();
const ref = vcr.createComponent(ProductQuickView);
```

**Cosa dire:**
> "Senza il `clear()` prima, ogni click su `Anteprima` aggiunge un componente al container. Cliccate 10 volte → 10 preview impilate (dentro al div ne vedete una, ma in memoria ci sono tutte e 10). Il `clear()` distrugge eventuali view precedenti, free dei loro listener e signal. È un'abitudine, fatela vostra."

### 4.5 `subscribe(close)` senza `takeUntilDestroyed`

In questo lab subscribe-iamo all'output `close` del `ProductQuickView` senza `takeUntilDestroyed`. Va bene perché:
- `ref.destroy()` (chiamato indirettamente da `vcr.clear()`) completa l'output, e la subscription si chiude da sola;
- l'host (`HomePage`) vive finché il `ViewContainerRef` esiste, quindi anche se l'output non fosse completato, alla sua distruzione tutto andrebbe via comunque.

**Cosa dire (se chiedono):**
> "Per gli output di componenti dinamici la subscribe è 'auto-pulita' dal cleanup del componente stesso. Diverso quando subscribete a un `BehaviorSubject` di un servizio condiviso che vive più del componente — lì serve `takeUntilDestroyed`. Lo vediamo nel Lab 2 con `NotificationService`."

---

## 5. Confronto con `<ng-template>` + `ngTemplateOutlet` (Scheda 07)

Il pulsante "Anteprima" nel slot footer è **DOM statico**. Lo slot `[badge]` con il fallback "Premium / categoria" è anche lui DOM statico. È perfettamente nel territorio della Scheda 06 (multi-slot).

Quand'è che servirebbe la Scheda 07? Esempio: se voleste lasciare al consumer la **decisione** di quale badge mostrare, ma il badge deve avere accesso ai **dati interni della card** (e.g. il prodotto stesso), allora il consumer dovrebbe passare un `<ng-template>` parametrizzato, non un `<span>`. Esempio:

```html
<!-- versione "Scheda 07" (NON in questo lab, solo per chi chiede) -->
<app-product-card [product]="p" [badgeTemplate]="customBadge">
  <ng-template #customBadge let-prod>
    <span>{{ prod.name }} - {{ prod.category }}</span>
  </ng-template>
</app-product-card>
```

Nel Lab 1 non serve perché il consumer (HomePage) ha **già** accesso al prodotto via `@for (product of …)`. Cogli l'occasione per ribadire la regola: scegliere `<ng-content>` quando il consumer ha già i dati che gli servono; passare a `<ng-template>` solo quando i dati sono interni al figlio.

---

## 6. Errori comuni degli studenti

### ❌ Errore 1: badge `[badge]` con `<span class="badge">`
**Sintomo:** il default non sparisce, il custom non appare. La home mostra sempre la categoria.
**Causa:** il selettore CSS `[badge]` matcha l'**attributo** (presenza o no), non la classe.
**Fix:** scrivere `<span badge>...` (attributo) invece di `<span class="badge">...`. Riferimento: errori comuni Scheda 06.

### ❌ Errore 2: `ProductQuickView` non standalone
**Sintomo:** `NG3001: Host directives must be standalone` oppure (in createComponent) un errore meno chiaro.
**Causa:** dimenticano `standalone: true` (in Angular 21 è il default ma alcuni IDE lo omettono nel template).
**Fix:** aggiungere `standalone: true` esplicito al `@Component`.

### ❌ Errore 3: `instance.product = p` invece di `setInput`
**Sintomo:** la preview appare con campi vuoti (`{{ product().name }}` resta nullo) oppure compile-error sui signal input.
**Causa:** stanno provando a settare un signal input come proprietà normale. Anche se non fosse signal, bypasserebbe il binding/CD.
**Fix:** `ref.setInput('product', p)`. Sempre.

### ❌ Errore 4: niente `$event.stopPropagation()` sul bottone Anteprima
**Sintomo:** cliccando "Anteprima" si apre la preview MA anche la navigazione al dettaglio.
**Causa:** la card è cliccabile (`(click)="goToDetail()"` sul div esterno) — l'evento bubble.
**Fix:** `(click)="openQuickView(p); $event.stopPropagation()"` sul bottone footer.

### ❌ Errore 5: chiamare `openQuickView` da `ngOnInit`
**Sintomo:** `Cannot read properties of undefined (reading 'createComponent')`.
**Causa:** in `ngOnInit` la view non è ancora montata, `viewChild()` torna `undefined`.
**Fix:** chiamarlo da un evento utente. Se è proprio necessario chiamarlo subito, usare `afterNextRender`.

### ❌ Errore 6: dimenticare `vcr.clear()` preventivo
**Sintomo:** dopo qualche click, la console mostra `console.log` multipli di prodotti diversi (se aggiungono qualche log al `ProductQuickView`), perché tutte le istanze sono ancora vive.
**Fix:** chiamare `vcr.clear()` come prima riga di `openQuickView`. È **anche** un cleanup automatico delle istanze precedenti.

---

## 7. Domande frequenti

**Q: Perché due slot e non uno solo "footer" con dentro tutto?**
A: Perché badge e footer hanno **posizioni diverse** nel template della card: il badge sta in alto sulla riga della categoria, il footer sotto al pulsante "Aggiungi". Multi-slot serve proprio a questo: smistare contenuti in posizioni distinte. Con uno slot solo avreste perso il controllo della posizione.

**Q: `ProductQuickView` ha lo stesso template/stile della pagina dettaglio. Potevamo riusarla?**
A: Ottima osservazione, e sì — un componente `ProductDetailContent` standalone, usato sia dalla pagina che dalla quick-view, sarebbe il refactor giusto. Per restare nei 60 min e mostrare il pattern di `createComponent` con qualcosa di nuovo, l'abbiamo riscritta. Nel vostro progetto reale, fattorizzate.

**Q: Cosa cambia se uso `inject(ViewContainerRef)` invece di `viewChild`?**
A: Il componente dinamico viene montato come "sibling" del componente che lo crea — fisicamente, dopo l'host. Per overlay e modal va bene (e a volte è anche meglio: niente container nel template). Per la preview di questo lab, l'anchor esplicita rende il punto di montaggio leggibile a chi legge il template. Discutete la differenza con la classe.

**Q: Posso aprire due quick-view contemporaneamente?**
A: Sì, basta NON chiamare `vcr.clear()` prima del `createComponent`. Ma sopprimerete il flow naturale (un solo focus per volta). Se davvero servono multiple preview (es. confronto prodotti), tenete un array `currentRefs: ComponentRef[]` e gestite i `destroy` singolarmente.

---

## 8. Adattamenti

### Se la classe è veloce (finiscono in 40 min):
Proponi a voce il refactor della Scheda 07: trasformare `[badge]` da `<ng-content>` a `[badgeTemplate]: TemplateRef<Product>` passato come `@Input()`. È un upgrade del lab che non era richiesto, ma collega bene la Scheda 06 e 07.

### Se la classe è lenta:
Tagliare il TODO 7 (cleanup esplicito) — è già implicito. Eventualmente saltare anche il TODO 3 e dare il badge premium già scritto nel `starter/` — concentrarsi sul `createComponent` che è il vero focus didattico.

### Cosa NON approfondire in aula:
- Host directives sulla card (rimandare al Lab 2 o ai progetti).
- `<ng-template>` parametrizzato con `let-prod` (è la Scheda 07, qui non serve).
- Gestione tastiera/`Escape`/click-fuori per chiudere la preview (UX, non Angular).

---

## 9. Verifica NAP (binario A)

A fine lab, applicare i 6 file di `solution/` sopra a `Corso/progetto/product-catalog-finale/`:

```bash
# (esegue l'utente, da fuori da questo lab)
cp -r Corso/G1/lab-01/solution/src/app/* Corso/progetto/product-catalog-finale/src/app/

cd Corso/progetto/product-catalog-finale
npx ng build       # atteso: Application bundle generation complete
npx ng test        # atteso: tutti i Test Files passed
```

Il seme `Corso/progetto/product-catalog/` resta intatto.
