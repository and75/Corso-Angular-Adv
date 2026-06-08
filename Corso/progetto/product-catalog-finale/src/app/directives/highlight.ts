import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  @Input() highlightColor: string = 'teal';

  private originalOutline: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.originalOutline = this.el.nativeElement.style.outline;
    this.el.nativeElement.style.outline = `0 0 0 2px ${this.highlightColor}`;
    this.el.nativeElement.style.transition = 'box-shadow 0.4s ease';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.outline = this.originalOutline;
  }
}
