import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../product.model';

/**
 * FilterProductsPipe — PRE-FORNITA
 * Filtra un array di Product per testo e categoria.
 */
@Pipe({
  name: 'filterProducts',
  standalone: true,
  pure: true
})
export class FilterProductsPipe implements PipeTransform {

  /**
   * transform()
   * @param products  - Array sorgente (valore prima del |)
   * @param search    - Testo di ricerca (primo : nel template)
   * @param category  - Categoria (secondo : nel template), '' = tutte
   * @returns Array filtrato
   */
  transform(products: Product[], search: string = '', category: string = ''): Product[] {
    if (!products || products.length === 0) {
      return [];
    }

    // Prepara il termine di ricerca: trim + lowercase per confronto case-insensitive
    const term = search.trim().toLowerCase();

    return products.filter(product => {
      // Filtro testo: cerca nel nome E nella descrizione
      const matchSearch = !term
        || product.name.toLowerCase().includes(term)
        || product.description.toLowerCase().includes(term);

      // Filtro categoria: se category è '' (vuoto), tutti passano il filtro
      const matchCategory = !category || product.category === category;

      // Entrambi i filtri devono essere soddisfatti (AND logico)
      return matchSearch && matchCategory;
    });
  }
}
