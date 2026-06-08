// admin.page.ts — SOLUZIONE lab-13b

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.page.html',
})
export class Admin {}
