/**
 * LAB 04 — SOLUTION
 * ─────────────────────────────────────────────────────────────────────────────
 * File: product.model.ts
 *
 * Modello esteso con CartItem (extends) e getFirst<T> (generics).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * ENUM: ProductCategory
 * Categorie del catalogo — string enum per leggibilità.
 */
export enum ProductCategory {
  Laptop     = 'Laptop',
  Smartphone = 'Smartphone',
  Tablet     = 'Tablet',
  Audio      = 'Audio',
  Accessori  = 'Accessori',
  Wearable   = 'Wearable',
  Desktop    = 'Desktop',
  Media      = 'Media'
}

/**
 * INTERFACCIA: Product
 * La base del nostro catalogo — dal Lab 02.
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  available: boolean;
  description?: string;
  imageUrl?: string;
}

/**
 * INTERFACCIA: CartItem extends Product
 *
 * Eredita tutte le proprietà di Product e aggiunge quantity.
 * Questo evita la duplicazione: se Product cambia, CartItem segue.
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * FUNZIONE GENERICA: getFirst<T>
 *
 * Restituisce il primo elemento di un array, oppure null se vuoto.
 * Il tipo T viene inferito dall'array passato come argomento.
 */
export function getFirst<T>(items: T[]): T | null {
  return items.length > 0 ? items[0] : null;
}