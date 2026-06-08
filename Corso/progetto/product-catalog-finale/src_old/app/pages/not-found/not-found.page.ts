import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * NotFoundPage — Pagina 404
 *
 * Mostrata dal Router quando nessuna rotta corrisponde all'URL corrente.
 * Configurata con path '**' come ULTIMA voce in app.routes.ts.
 *
 * COME FUNZIONA IL WILDCARD '**':
 * Il Router testa le rotte dall'alto verso il basso.
 * Se nessuna rotta fa match, arriva a '**' che cattura tutto.
 *
 * ORDINE CRITICO: '**' deve essere sempre l'ultima rotta.
 * Se fosse prima di '/catalog', catturerebbe anche /catalog
 * e gli utenti vedrebbero sempre il 404 invece del catalogo.
 *
 * Componente intenzionalmente semplice: solo UI statica + link.
 */
@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.page.html'
})
export class NotFoundPage {}
