import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightDirective } from '../../directives/highlight.directive';

/**
 * CardContainer — SOLUZIONE COMPLETA
 * Wrapper generico con ng-content e varianti colore.
 */
@Component({
  selector: 'app-card-container',
  standalone: true,
  imports: [CommonModule,HighlightDirective],
  templateUrl: './card-container.html'
})
export class CardContainer {

  @Input() title: string = '';

  /**
   * variant — @Input()
   * Determina il colore dell'intestazione.
   */
  @Input() variant: 'default' | 'success' | 'warning' | 'info' = 'default';

  /**
   * headerClass — getter
   * Mappa la variant alle classi Tailwind corrispondenti.
   * Usiamo uno switch/case — chiaro e senza tipi avanzati.
   */
  get headerClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-green-50 border-b border-green-100 text-green-800';
      case 'warning': return 'bg-yellow-50 border-b border-yellow-100 text-yellow-800';
      case 'info':    return 'bg-blue-50 border-b border-blue-100 text-blue-800';
      default:        return 'bg-gray-50 border-b border-gray-100 text-gray-800';
    }
  }
}
