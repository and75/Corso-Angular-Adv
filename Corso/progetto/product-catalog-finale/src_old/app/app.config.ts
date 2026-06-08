import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * app.config.ts — Configurazione dell'applicazione
 *
 * Questo file sostituisce il vecchio AppModule (architettura standalone).
 * Ogni "provider" registra un servizio o feature a livello globale.
 *
 * PROVIDERS:
 * - provideHttpClient() → abilita HttpClient in tutta l'app
 *   (necessario per le chiamate HTTP del ProductService)
 *
 * - provideRouter(routes) → abilita il Router Angular con la configurazione
 *   definita in app.routes.ts. Senza questo provider:
 *   • <router-outlet> non funziona
 *   • [routerLink] lancia "NullInjectorError: No provider for Router!"
 *   • inject(Router) / inject(ActivatedRoute) non funzionano
 *
 * COME FUNZIONA:
 * Angular usa questo oggetto in main.ts:
 *   bootstrapApplication(App, appConfig)
 * I provider qui dichiarati sono disponibili in tutta l'applicazione.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Abilita HttpClient — necessario per il ProductService
    provideHttpClient(),

    // Abilita il Router con la configurazione delle rotte
    // routes è importato da app.routes.ts
    provideRouter(routes)
  ]
};
