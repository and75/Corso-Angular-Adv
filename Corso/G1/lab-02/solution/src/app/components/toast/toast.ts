/**
 * LAB 2 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: src/app/components/toast/toast.ts
 *
 * Consumer del NotificationService. Sottoscrive notifications$ con
 * takeUntilDestroyed(destroyRef) → niente memory leak.
 *
 * Lo state esposto al template è un signal locale alimentato dall'Observable:
 * uniforma il consumer al resto del seme (che usa molto signal/computed).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
})
export class Toast {

  private notifications = inject(NotificationService);
  private destroyRef    = inject(DestroyRef);

  readonly list = signal<Notification[]>([]);

  constructor() {
    // ✅ takeUntilDestroyed(destroyRef): cleanup automatico al destroy del componente
    this.notifications.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(list => this.list.set(list));
  }

  dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
