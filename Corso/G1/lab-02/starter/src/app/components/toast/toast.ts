/**
 * LAB 2 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/toast/toast.ts
 *
 * Consumer del NotificationService. Sottoscrive notifications$ e cancella
 * automaticamente la sottoscrizione quando il componente viene distrutto
 * (vedi Scheda 10 §"Cancellare la sottoscrizione: takeUntilDestroyed").
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component } from '@angular/core';
// TODO 2: aggiungi all'import di '@angular/core' anche:
//          - DestroyRef: token DI per ottenere la "destroy gate" del componente
//          - inject: la funzione di iniezione moderna
//          - signal: per dichiarare lo stato locale che alimenterà il template
// TODO 2: importa qui sotto takeUntilDestroyed da '@angular/core/rxjs-interop'.
// TODO 2: importa NotificationService e il tipo Notification dal servizio
//         '../../services/notification.service' (il servizio del TODO 1).

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
})
export class Toast {

  /**
   * TODO 2 — [MEDIO] Dichiarare i campi privati:
   *
   *   - notifications : inject(NotificationService). È il publisher.
   *   - destroyRef    : inject(DestroyRef). Lo passeremo a takeUntilDestroyed
   *                     per agganciare la cancellazione al lifecycle del componente.
   *
   *   E un campo pubblico/readonly:
   *
   *   - list : signal<Notification[]>([]). Lo state locale che il template
   *            legge come list(). Lo alimentiamo dall'Observable nel constructor.
   *
   *   Perché un signal locale invece di consumare l'Observable con async pipe?
   *   Per coerenza con il resto del seme (che usa molto signal/computed) e per
   *   poter aggiungere facilmente in futuro un computed (es. count, hasErrors).
   */

  /**
   * TODO 2 — [MEDIO] Nel constructor, sottoscrivere notifications.notifications$
   *   passando per pipe(takeUntilDestroyed(this.destroyRef)).
   *   Nel callback next: chiama this.list.set(listaRicevuta).
   *
   *   ATTENZIONE: takeUntilDestroyed() senza argomento funziona SOLO se chiamato
   *   in un injection context (inizializzatore di proprietà o constructor).
   *   Qui siamo nel constructor → funziona. Tuttavia conviene PASSARE
   *   ESPLICITAMENTE this.destroyRef: rende chiaro a chi legge che la
   *   sottoscrizione è agganciata al destroy DI QUESTO componente.
   */

  /**
   * TODO 2 — [MEDIO] Implementare dismiss(id: number):
   *   delega a this.notifications.dismiss(id). Il servizio aggiornerà il
   *   BehaviorSubject; la nostra subscribe riceverà il nuovo array; il signal
   *   list verrà aggiornato; il template si ridisegnerà. Tutto in 4 step.
   */
}
