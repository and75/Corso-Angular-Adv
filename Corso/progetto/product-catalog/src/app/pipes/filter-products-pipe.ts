import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../product.model';

@Pipe({
  name: 'filterProducts',
})
export class FilterProductsPipe implements PipeTransform {
  transform(products: Product[], search: string = ''): Product[] {
    if (!products || products.length === 0) return [];

    const term = search.trim().toLowerCase();

    return products.filter(product => {
      const matchSearch = !term
        || product.name.toLowerCase().includes(term)
        || (product.description && product.description.toLowerCase().includes(term));
      return matchSearch;
    });
  }
}
