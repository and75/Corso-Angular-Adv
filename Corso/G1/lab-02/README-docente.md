# Lab 2 — NotificationService + Carousel Splide
## Guida per il Docente

---

## 1. Scopo Didattico

Secondo lab del Mod 1: applica direttamente la Scheda 10 (entrambe le parti) su due componenti **nuovi** del seme. È un lab "compatto" (35 min) per chiudere la giornata G1 prima del recap finale.

Tre messaggi chiave:

1. **`BehaviorSubject` ≠ `signal`** — entrambi rappresentano "stato che cambia", ma il primo è un publisher in **mondo Observable**: è ciò che usi quando il consumer ha già una pipe RxJS in mano (interceptor, async pipe, takeUntilDestroyed).
2. **`runOutsideAngular`** non è un'ottimizzazione esoterica: è il default quando integri una libreria che si gestisce da sola. Senza, ogni libreria "veloce" rende la tua app lenta.
3. **`destroyRef.onDestroy`** è la riga che differenzia codice da junior (memory leak nascosti) e codice da senior (cleanup esplicito, leggibile, ripetibile).

---

## 2. Timing Consigliato

**Slot orario: 16:15–16:50 (35 min)**

| Fase | Attività | Durata |
|---|---|---|
| Intro | Demo del risultato finale (carousel + toast in azione) | 2 min |
| Setup | `npm install @splidejs/splide` su `product-catalog-finale/` | 3 min |
| Parte 1 | TODO 1: `NotificationService` con BehaviorSubject + asObservable | 5 min |
| Parte 1 | TODO 2: `Toast` con takeUntilDestroyed + @for | 5 min |
| Parte 1 | TODO 3: mount `<app-toast />` in `app.html` + verifica visiva (push manuale via console) | 5 min |
| Parte 2 | TODO 4: `Carousel` standalone (afterNextRender + runOutsideAngular + destroy) | 7 min |
| Parte 2 | TODO 5: mount `<app-carousel />` in `home.page.html` + verifica visiva | 3 min |
| Bonus | TODO 6 auto-dismiss (solo se rimane tempo) | 3 min |
| Recap | Punti chiave + Q&A | 2 min |
| **Totale** | | **~35 min** |

> Se a metà ti accorgi che la classe arranca, **salta il TODO 6** (è esplicitamente opzionale) e dai più tempo al recap finale del giorno (Mod 1 in 5 schede + 2 lab è denso).

---

## 3. Contesto nella Scaletta

Questo è l'**ultimo lab del Giorno 1**. Subito dopo c'è il recap di giornata (16:50–17:00). Gli studenti sono stanchi: tieni il ritmo serrato, evita digressioni, premia chi finisce in tempo passando rapidamente alla parte successiva.

Aggancio con quello che già sanno:
- Mod 0 Scheda 02 → `subscribe`, `pipe`, `catchError`. Qui per la prima volta vedono `takeUntilDestroyed` "in pratica".
- Mod 0 Scheda 04 → `provideHttpClient` con `appConfig.providers`. `NotificationService` invece usa `providedIn: 'root'` (la via più semplice).
- Lab 1 → componenti dinamici. Qui i componenti sono dichiarati statici nel template (niente createComponent). Riprendiamo "il filo conduttore semplice".

---

## 4. Soluzione Commentata — Punti chiave

### 4.1 `asObservable()` come gate di sicurezza

```typescript
private list$ = new BehaviorSubject<Notification[]>([]);
readonly notifications$: Observable<Notification[]> = this.list$.asObservable();
```

**Cosa dire:**
> "Notate il `private`. Il subject non esce mai dal servizio. Quello che esce è un Observable: API ridotta, niente metodi `next`/`error`/`complete` visibili al consumer. È la stessa idea della `private products: Product[]` del Lab 10 del corso base: chi usa il servizio, ne usa l'API pubblica, non i suoi dati interni."

### 4.2 Push immutabile con spread

```typescript
this.list$.next([...this.list$.value, n]);
```

**Cosa dire:**
> "Se faceste `list$.value.push(n)` e poi `list$.next(list$.value)`, il riferimento all'array non cambia. Subject confronta per riferimento. La UI non vedrebbe il cambiamento. Lo spread crea sempre un nuovo array: nuovo riferimento, change detection felice."

### 4.3 `takeUntilDestroyed(this.destroyRef)` dentro al constructor

```typescript
constructor() {
  this.notifications.notifications$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(list => this.list.set(list));
}
```

**Cosa dire:**
> "Il constructor è un injection context. `takeUntilDestroyed()` senza argomento funzionerebbe qui. Però **passare esplicitamente** `this.destroyRef` rende chiaro a chi legge che il cleanup è agganciato al destroy del componente. È documentazione gratuita. Nei vostri progetti, scegliete uno stile e siate coerenti."

### 4.4 `afterNextRender` invece di `ngAfterViewInit`

```typescript
constructor() {
  afterNextRender(() => {
    this.zone.runOutsideAngular(() => {
      this.splide = new Splide(...).mount();
    });
  });
}
```

**Cosa dire:**
> "`afterNextRender` parte solo nel browser, mai sul server. Per Mod 6 (SSR) è fondamentale: Splide tocca `document` e su Node non esiste. Con `ngAfterViewInit` invece dovremmo controllare `isPlatformBrowser` esplicitamente. `afterNextRender` lo fa per noi."

### 4.5 Cleanup con `destroyRef.onDestroy` invece di `ngOnDestroy`

**Cosa dire:**
> "Lo stesso identico effetto. `onDestroy` ha però due vantaggi: lo dichiarate **vicino** alla risorsa che deve essere pulita (init e cleanup nello stesso constructor) e non vi obbliga a creare un metodo della classe che potrebbe essere chiamato da fuori. Più leggibile, più sicuro."

---

## 5. Errori comuni degli studenti

### ❌ Errore 1: dimenticare l'import di `@splidejs/splide/css`
**Sintomo:** Splide funziona logicamente ma le slide appaiono "rotte" (nessuna animazione, slide impilate verticalmente).
**Causa:** mancano gli stili di Splide.
**Fix:** `import '@splidejs/splide/css';` in cima a `carousel.ts`. In alternativa nel `angular.json` (sezione `styles`).

### ❌ Errore 2: `subscribe` senza `takeUntilDestroyed`
**Sintomo:** memory leak silenzioso. Navighi via dalla pagina, ricaricala 10 volte → 10 sottoscrizioni vive al servizio (visibili coi DevTools Performance).
**Fix:** `pipe(takeUntilDestroyed(this.destroyRef))`. Soluzione alternativa: usare l'`async` pipe nel template invece di `subscribe`.

### ❌ Errore 3: subject esposto pubblicamente
```typescript
notifications$ = new BehaviorSubject<Notification[]>([]);   // ❌ public
```
Sintomo: nessuno se ne accorge subito. Mese dopo, un componente fa `notifications$.next([])` perché "deve" pulire i toast. Il servizio non se ne accorge, lo stato si corrompe.
**Fix:** `private list$` + `readonly notifications$ = list$.asObservable()`. Discutete con la classe: "se è tentazione di scriverci, non è API pubblica".

### ❌ Errore 4: `setTimeout` dentro `zone.run`
```typescript
this.zone.run(() => setTimeout(() => this.dismiss(n.id), ttl));  // ❌
```
Sintomo: il timeout scatena CD ad ogni tick di `setTimeout`. Defeats the point.
**Fix:** `runOutsideAngular(() => setTimeout(() => zone.run(() => dismiss(...))))` — fuori zone il setTimeout, dentro zone solo la chiamata che cambia lo state.

### ❌ Errore 5: `host.nativeElement` undefined in `ngOnInit`
**Sintomo:** errore a runtime in fase di mount.
**Causa:** `viewChild` ritorna `undefined` in `ngOnInit` (la view non è ancora montata).
**Fix:** usare `afterNextRender` (o `ngAfterViewInit` come second-best). Riferimento: errori comuni Scheda 08.

### ❌ Errore 6: Splide istanziato due volte
Sintomo: dopo un router-navigate (away + back), il carousel appare doppio o ha listener orfani.
**Causa:** il vecchio `Splide` non è stato distrutto.
**Fix:** `destroyRef.onDestroy(() => splide?.destroy())`.

---

## 6. Domande frequenti

**Q: Perché un `signal` locale nel `Toast` se il servizio ha già lo state?**
A: Tre motivi: (1) il template legge `list()` come signal e non come `async`, più uniforme col resto del seme; (2) potete derivare facilmente computed (es. `count = computed(() => list().length)`); (3) la subscribe esplicita lascia spazio per filtri/trasformazioni RxJS in `pipe` prima di alimentare il signal.

**Q: `BehaviorSubject<Notification[]>([])` o `Subject<Notification[]>()`?**
A: `BehaviorSubject` — perché un componente che si sottoscrive **dopo** che sono stati emessi toast deve vedere lo stato corrente (i toast attivi), non solo i futuri. `Subject` puro non replica l'ultimo valore.

**Q: `BehaviorSubject` vs `signal` — quando uno e quando l'altro?**
A: Vedi tabella decisionale in Scheda 10. Riassumendo: signal se il consumer è solo il template di un componente; BehaviorSubject se il consumer è multiplo, sconosciuto, o tu vuoi tirare dentro una pipe RxJS (es. interceptor del Mod 4).

**Q: Perché Splide e non un carousel scritto in Angular?**
A: Per mostrare come si integra una libreria esterna che lavora sul DOM. Il pattern (afterNextRender + runOutsideAngular + onDestroy) si replica per **qualsiasi** libreria simile: Chart.js, Leaflet, Three.js, video player, editor di testo. È il "modello mentale" che vogliamo lasciare in aula.

**Q: Splide ha gli @types?**
A: Sì, sono nel pacchetto principale (`@splidejs/splide` esporta i tipi). Non serve `@types/splidejs`.

---

## 7. Adattamenti

### Classe veloce (resta tempo):
- TODO 6 (auto-dismiss) — è il bonus naturale.
- Chiedere: "come fareste partire un toast `error` quando una chiamata HTTP fallisce?" → anticipo Mod 4 (errorInterceptor che inietta `NotificationService`).

### Classe lenta:
- Tagliare il TODO 6 (esplicitamente opzionale).
- Eventualmente saltare il TODO 5 (carousel mount) lasciando il TODO 4 (componente scritto ma non integrato) — il pattern resta visibile nel file.

### Cosa NON approfondire:
- Animazioni di entrata/uscita dei toast (Angular animations / CSS transition).
- `shareReplay`/`distinctUntilChanged` sul `notifications$` — sono ottimizzazioni che richiedono altri 10 minuti di teoria che oggi non abbiamo.
- Multi-istanza di carousel sulla stessa pagina — Splide la gestisce nativamente, ma il debug nel browser è dispendioso in aula.

---

## 8. Verifica NAP (binario A)

A fine lab, applicare i file di `solution/` sopra a `product-catalog-finale/` (cumulativamente con Lab 0 e Lab 1 già applicati), installare Splide, e lanciare:

```bash
cp -r Corso/G1/lab-02/solution/src/app/. Corso/progetto/product-catalog-finale/src/app/

cd Corso/progetto/product-catalog-finale
npm install @splidejs/splide
npx ng build           # atteso: Application bundle generation complete
npx ng test            # atteso: tutti i Test Files passed
```

Il seme `Corso/progetto/product-catalog/` resta intatto.
