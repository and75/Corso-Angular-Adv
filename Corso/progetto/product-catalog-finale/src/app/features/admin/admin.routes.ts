// features/admin/admin.routes.ts — SOLUTION Lab 3 G2
// Default export Routes della feature admin: una rotta padre con AdminLayout
// + canActivate sull'area + children (landing, lista, edit).

import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout/admin-layout';
import { Admin } from '../../pages/admin/admin.page';
import { AdminList } from './pages/admin-list/admin-list';
import { ProductFormPage } from '../../pages/product-form/product-form.page';
import { authGuard } from '../../auth-guard';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],          // ✅ guard a livello di AREA: vale per tutti i children
    children: [
      // ✅ TODO 3 — landing pulita: pathMatch:'full' evita match accidentali su /admin/qualcosa
      { path: '', pathMatch: 'full', component: Admin },

      // ✅ TODO 4 — lista con querystring (search + paginazione)
      { path: 'products', component: AdminList },

      // ✅ TODO 2 — riuso del ProductFormPage esistente come children edit
      { path: 'products/:id/edit', component: ProductFormPage },
    ],
  },
];

// ✅ TODO 1 — default export OBBLIGATORIO per loadChildren
export default adminRoutes;
