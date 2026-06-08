/**
 * LAB 2 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/services/notification.service.ts
 *
 * Servizio singleton (providedIn: 'root') che pubblica una lista di toast
 * tramite BehaviorSubject, esposta read-only come Observable.
 *
 * Punti chiave:
 *   ✅ private list$ + readonly notifications$ → incapsulamento
 *   ✅ push immutabile con [...list$.value, n] → CD/subscriber rilevano la modifica
 *   ✅ id auto-generato per dismiss puntuale
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // Stato interno (immutabile): nessuno fuori può fare next()
  private list$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  // API pubblica read-only
  readonly notifications$: Observable<Notification[]> = this.list$.asObservable();

  success(message: string): void { this.push('success', message); }
  error(message: string)   : void { this.push('error',   message); }
  info(message: string)    : void { this.push('info',    message); }

  dismiss(id: number): void {
    this.list$.next(this.list$.value.filter(n => n.id !== id));
  }

  private push(type: Notification['type'], message: string): void {
    const n: Notification = { id: this.nextId++, type, message };
    this.list$.next([...this.list$.value, n]);   // ✅ nuovo riferimento sempre
  }
}
