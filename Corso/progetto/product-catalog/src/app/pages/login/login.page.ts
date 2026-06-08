// login.page.ts — SOLUZIONE lab-13a
// Form di login con FormsModule (template-driven): ngModel, NgForm.

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
})
export class Login {

  private router = inject(Router);

  // Oggetto dati: Angular scrive qui tramite [(ngModel)]
  loginData = { email: '', password: '' };

  onSubmit(isValid: boolean | null): void {
    // isValid viene dal template: f.valid passato come argomento
    if (!isValid) return;

    // Demo auth: salva token statico e naviga ad /admin
    // In produzione: this.authService.login(email, password).subscribe(...)
    localStorage.setItem('token', 'demo-token');
    this.router.navigate(['/admin']);
  }
}
