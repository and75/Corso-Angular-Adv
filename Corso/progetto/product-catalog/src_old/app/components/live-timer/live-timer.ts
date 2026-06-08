import { ChangeDetectorRef, Component, inject, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

/**
 * LiveTimer — SOLUZIONE Lab 08
 *
 * Mostra l'ora corrente nell'header e aggiorna ogni secondo.
 * Dimostra i tre lifecycle hook principali con console.log.
 */
@Component({
  selector: 'app-live-timer',
  standalone: true,
  imports: [],
  templateUrl: './live-timer.html',
  styles: [':host { display: contents }']
})
export class LiveTimer implements OnInit, OnChanges, OnDestroy {

  /**
   * format — @Input()
   * Formato dell'ora: 24 ore o 12 ore (AM/PM).
   * Quando cambia, ngOnChanges viene chiamato prima che il template si aggiorni.
   */
  @Input() format: '24h' | '12h' = '24h';

  currentTime = '';
  private timerId: number | null = null;
  private cdr = inject(ChangeDetectorRef);

  /**
   * ngOnChanges — chiamato PRIMA di ngOnInit e ad ogni cambio di @Input().
   * SimpleChanges contiene i valori precedente e corrente di ogni Input cambiato.
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log('[LiveTimer] ngOnChanges', {
      previousValue: changes['format'].previousValue,
      currentValue: changes['format'].currentValue,
      firstChange: changes['format'].firstChange
    });
    this.updateTime();
  }

  /**
   * ngOnInit — chiamato UNA SOLA VOLTA dopo il primo ngOnChanges.
   * È il posto giusto per avviare il timer: qui gli @Input() sono disponibili.
   */
  ngOnInit(): void {
    console.log('[LiveTimer] ngOnInit — avvio setInterval');
    this.timerId = window.setInterval(() => this.updateTime(), 1000);
  }

  /**
   * ngOnDestroy — chiamato quando il componente viene rimosso dal DOM.
   * Senza clearInterval il timer continuerebbe a girare — memory leak.
   */
  ngOnDestroy(): void {
    console.log('[LiveTimer] ngOnDestroy — clearInterval, timer fermato');
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('it-IT', {
      hour12: this.format === '12h'
    });
    
    console.log('[LiveTimer] updateTime', this.currentTime);
    this.cdr.markForCheck();
  }
}
