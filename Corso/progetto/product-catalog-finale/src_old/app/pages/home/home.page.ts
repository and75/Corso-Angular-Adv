import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * HomePage — Pagina di benvenuto
 *
 * Componente semplice: nessun servizio iniettato, nessun ngOnInit.
 * Solo UI statica con un link di navigazione al catalogo.
 *
 * NAMING CONVENTION (importante!):
 * - File:     home.page.ts         (suffisso .page.ts)
 * - Classe:   HomePage             (suffisso Page)
 * - Selector: app-home-page
 *
 * Angular non distingue "pagine" da "componenti" — è una convenzione
 * del progetto per rendere subito chiaro qual è il ruolo del file.
 * Le "pagine" sono i componenti registrati in app.routes.ts.
 *
 * NOTA: importiamo RouterLink per usare [routerLink] nel template.
 * Senza questo import, Angular lancerebbe un errore:
 * "Can't bind to 'routerLink' since it isn't a known property"
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.page.html'
})
export class HomePage {}
