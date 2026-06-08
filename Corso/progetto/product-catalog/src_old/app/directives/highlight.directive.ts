import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * HighlightDirective — SOLUZIONE COMPLETA
 * Direttiva attributo che evidenzia un elemento al hover.
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective { 

  @Input() highlightColor: string = 'teal';

  /** Salva il box-shadow originale per il ripristino al mouseleave */
  private originalBoxShadow: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.originalBoxShadow = this.el.nativeElement.style.boxShadow;
    this.el.nativeElement.style.boxShadow = '0 0 0 2px ' + this.highlightColor;
    this.el.nativeElement.style.transition = 'box-shadow 0.2s ease';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.el.nativeElement.style.boxShadow = this.originalBoxShadow;
  }
}
