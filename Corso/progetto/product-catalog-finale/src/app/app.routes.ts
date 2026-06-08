// app.routes.ts — SOLUTION Lab 3 G2
// Delta rispetto al seme:
//  ✅ TODO 1 — rotta 'admin' eager sostituita da loadChildren su admin.routes.ts
//  ✅ TODO 5 — aggiunta rotta named outlet 'cart' su outlet: 'panel'

import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { authGuard } from './auth-guard';
import { Login } from './pages/login/login.page';
import { CartPreviewPanel } from './components/cart-preview-panel/cart-preview-panel';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'login', component: Login },

  // ✅ TODO 1 — feature area admin lazy (loadChildren con default export)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.default),
  },

  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
  },
  {
    path: 'products/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/product-form/product-form.page').then(m => m.ProductFormPage),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage),
  },

  // ✅ TODO 5 — rotta named outlet 'panel' per il cart preview
  {
    path: 'cart',
    outlet: 'panel',
    component: CartPreviewPanel,
  },
];
