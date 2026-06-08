/**
 * PRODUCT MODEL — Lab 05
 * Stessi tipi dei lab precedenti + CartItem per il riepilogo carrello.
 */

export enum ProductCategory {
  Laptop      = 'Laptop',
  Smartphone  = 'Smartphone',
  Tablet      = 'Tablet',
  Audio       = 'Audio',
  Accessori   = 'Accessori',
  Wearable    = 'Wearable'
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  available: boolean;
  imageUrl: string;
}

/**
 * CartItem — INTERFACCIA PRE-FORNITA
 * Rappresenta un prodotto nel carrello con la sua quantità.
 * Estende concettualmente Product aggiungendo il campo 'quantity'.
 *
 * Perché non usare Product direttamente?
 * Perché un prodotto nel carrello ha uno stato aggiuntivo (quantity)
 * che non appartiene al catalogo. Separare i modelli mantiene il codice pulito.
 */
export interface CartItem {
  /** Il prodotto a cui si riferisce questo item del carrello */
  product: Product;
  /** Quantità aggiunta al carrello (minimo 1) */
  quantity: number;
}
