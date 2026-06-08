// auth-guard.ts — SOLUZIONE lab-13a
// Delta: legge il token da localStorage invece di restituire sempre true.

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // ✅ MODIFICATO: legge il token da localStorage
  // Prima era: const token = true
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  // Nessun token → redirect a /login
  return router.createUrlTree(['/login']);
};
