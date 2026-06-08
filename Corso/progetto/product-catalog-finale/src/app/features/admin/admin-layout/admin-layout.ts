// features/admin/admin-layout/admin-layout.ts — SOLUTION Lab 3 G2
// Componente layout dell'area admin: stateless, delega tutto al router.

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {}
