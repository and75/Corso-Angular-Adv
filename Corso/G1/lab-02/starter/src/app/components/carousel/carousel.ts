/**
 * LAB 2 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/carousel/carousel.ts
 *
 * Wrapper Angular per Splide.js (libreria carousel vanilla JS). È il caso
 * "studio" della Scheda 10 §Parte A: una libreria che lavora sul DOM e si
 * gestisce da sola, da integrare senza intasare il change detection.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component } from '@angular/core';
// TODO 4: aggiungi all'import di '@angular/core' tutto quello che serve:
//          - ElementRef (per tipizzare il riferimento al <section>)
//          - NgZone     (per uscire dalla zone durante init e callback Splide)
//          - DestroyRef (per registrare il cleanup)
//          - inject     (la funzione di iniezione moderna)
//          - afterNextRender (hook SSR-safe per inizializzare dopo il primo render)
//          - input      (signal input)
//          - viewChild  (signal che punta al nodo nel template)
// TODO 4: importa Splide come default da '@splidejs/splide'.
// TODO 4: importa gli stili Splide con: import '@splidejs/splide/css';
//         (senza questa riga le slide appaiono "rotte", impilate verticalmente)

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.html',
})
export class Carousel {

  /**
   * TODO 4 — [MEDIO] Dichiarare:
   *
   *   - slides     : signal INPUT richiesto, tipo string[]
   *                  (è l'array di testi statici che mostreremo nelle slide).
   *                  Usa la forma input.required<string[]>().
   *
   *   - zone       : PRIVATE, inject(NgZone). Serve per runOutsideAngular.
   *
   *   - destroyRef : PRIVATE, inject(DestroyRef). Serve per onDestroy.
   *
   *   - host       : PRIVATE, viewChild.required<ElementRef<HTMLElement>>('host').
   *                  La reference "#host" è quella sul <section> nel template.
   *                  Usiamo .required perché senza nodo host la mount fallisce.
   *
   *   - splide     : PRIVATE, opzionale, tipo Splide | undefined.
   *                  Tiene il riferimento all'istanza per il destroy().
   */

  /**
   * TODO 4 — [MEDIO] Nel constructor:
   *
   *   INIT — registra afterNextRender(...):
   *    1. Dentro afterNextRender, usa zone.runOutsideAngular(() => {...}).
   *    2. Dentro runOutsideAngular:
   *       a) Istanzia Splide passando host().nativeElement e un oggetto opzioni.
   *          Opzioni richieste in questo lab: type: 'loop', perPage: 1,
   *          autoplay: true, interval: 3000.
   *       b) Chiama .mount() sull'istanza.
   *       c) Salva l'istanza in this.splide.
   *
   *      Perché runOutsideAngular? Splide ha animazioni e listener nativi che
   *      altrimenti scatenerebbero il CD a ogni frame — l'app rallenta vistosamente
   *      (vedi Scheda 10 §"Errori comuni — A.2").
   *
   *   CLEANUP — sempre nel constructor:
   *    3. destroyRef.onDestroy(() => this.splide?.destroy())
   *       Senza questo, navigando via dalla pagina e tornando si crea una NUOVA
   *       istanza Splide ma la vecchia resta agganciata al DOM (memory leak).
   *
   *   NOTA: l'ordine non importa (init e cleanup sono entrambi registrazioni
   *   con callback — l'init scatta al primo render, il cleanup al destroy).
   */
}
