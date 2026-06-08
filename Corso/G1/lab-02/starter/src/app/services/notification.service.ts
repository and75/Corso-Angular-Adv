/**
 * LAB 2 — STARTER
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/services/notification.service.ts
 *
 * Servizio nuovo del Lab 2. Pubblica una lista di toast attivi tramite un
 * BehaviorSubject e la espone read-only ai consumer (vedi Scheda 10 §Parte B).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Injectable } from '@angular/core';
// TODO 1: aggiungi qui sopra l'import delle due classi RxJS che servono:
//          - il Subject "stateful" che mantiene un valore iniziale e replica
//            l'ultimo valore ai late subscriber;
//          - il tipo "Observable" per tipizzare l'esposizione read-only.

/**
 * TODO 1 — [FACILE] Dichiarare qui sopra (a livello di modulo) l'interfaccia
 *   Notification con tre campi:
 *     id      : number
 *     type    : union literal 'success' | 'error' | 'info'
 *     message : string
 *   È il tipo dei toast che pubblicheremo.
 */

@Injectable({ providedIn: 'root' })
export class NotificationService {

  /**
   * TODO 1 — [FACILE] Dichiarare lo stato interno + il contatore degli id:
   *
   *   - list$  : PRIVATE, di tipo BehaviorSubject<Notification[]>, valore
   *              iniziale [] (array vuoto). DEVE essere private:
   *              i consumer non devono poter chiamare next() dall'esterno.
   *
   *   - nextId : PRIVATE, number, partiamo da 1. Lo incrementeremo a ogni
   *              push per generare id univoci.
   */

  /**
   * TODO 1 — [FACILE] Esporre l'Observable read-only:
   *
   *   - notifications$ : READONLY, tipo Observable<Notification[]>.
   *     È list$ "downcasted" con .asObservable(): chi riceve questo
   *     riferimento può sottoscriversi ma non può fare next/error/complete
   *     (incapsulamento dello stato — Scheda 10 §"Pattern del NotificationService").
   */

  /**
   * TODO 1 — [FACILE] Implementare i metodi pubblici per pubblicare un toast:
   *
   *   success(message: string): void
   *   error(message: string)  : void
   *   info(message: string)   : void
   *
   *   Tutti e tre delegano al privato push(type, message) qui sotto.
   *
   *   E un metodo dismiss(id: number) che rimuove dalla lista il toast
   *   con quell'id:
   *     this.list$.next(this.list$.value.filter(n => n.id !== id));
   *   Nota: list$.value è l'accesso sincrono al valore corrente del
   *   BehaviorSubject (non disponibile in Subject puro).
   */

  /**
   * TODO 1 — [FACILE] Implementare il metodo privato push:
   *
   *   push(type: Notification['type'], message: string): void
   *
   *   Deve:
   *    1. Creare l'oggetto Notification con id = this.nextId++ (post-increment).
   *    2. Emettere un NUOVO array che contiene tutti i toast esistenti + il nuovo:
   *       usa lo spread operator [...list$.value, n].
   *
   *   ATTENZIONE: NON usare list$.value.push(n) seguito da list$.next(list$.value).
   *   I subscriber comparano per riferimento — riusando lo stesso array
   *   non vedrebbero il cambiamento (errore comune Scheda 10 §B.2).
   */
}
