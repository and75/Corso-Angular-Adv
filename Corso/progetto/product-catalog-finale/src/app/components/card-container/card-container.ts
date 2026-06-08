import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-container',
  imports: [],
  templateUrl: './card-container.html',
  styleUrl: './card-container.css',
})
export class CardContainer {
  @Input() title: string = '';
  @Input() variant: 'default' | 'success' | 'warning' | 'info' = 'default';

  get headerClass(): string {
    switch (this.variant) {
      case 'success': return 'bg-green-50 border-b border-green-100 text-green-800';
      case 'warning': return 'bg-yellow-50 border-b border-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-50 border-b border-blue-100 text-blue-800';
      default: return 'bg-gray-50 border-b border-gray-100 text-gray-800';
    }
  }


}
