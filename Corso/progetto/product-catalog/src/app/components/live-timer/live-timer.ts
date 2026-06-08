import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-live-timer',
  standalone: true,
  imports: [],
  templateUrl: './live-timer.html',
  styles: [':host { display: contents }']
})
export class LiveTimer implements OnInit, OnChanges, OnDestroy {

  @Input() format: '24h' | '12h' = '24h';

  currentTime = '';
  private timerId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`[LiveTimer] ngOnChanges — format: ${changes['format'].previousValue} -> ${changes['format'].currentValue} (firstChange: ${changes['format'].firstChange})`);
    this.updateTime();
  }

  ngOnInit(): void {
    console.log('[LiveTimer] ngOnInit — avvio setInterval');
    this.timerId = window.setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    console.log('[LiveTimer] ngOnDestroy — timer fermato');
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
  }
}
