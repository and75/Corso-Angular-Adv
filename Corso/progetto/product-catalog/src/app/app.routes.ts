// app.routes.ts — SOLUZIONE lab-finale

import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { authGuard } from './auth-guard';
import { Login } from './pages/login/login.page';
import { Admin } from './pages/admin/admin.page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'login', component: Login },
  { path: 'admin', canActivate: [authGuard], component: Admin },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
  },
  // ✅ products/new PRIMA di products/:id — "new" non venga catturato come :id
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
];
