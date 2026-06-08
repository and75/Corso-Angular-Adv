import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * SearchBar — SOLUZIONE COMPLETA
 * Componente di ricerca testuale con two-way binding e pulsante reset.
 *
 * PATTERN CHIAVE:
 * [(ngModel)] gestisce il binding bidirezionale del testo localmente.
 * @Output() EventEmitter<string> comunica il cambiamento verso il padre.
 * I due meccanismi coesistono: uno è interno, l'altro è esterno.
 */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html'
})
export class SearchBar {

  /**
   * searchTerm
   * Stato interno del campo di ricerca.
   * Legato al template tramite [(ngModel)] — si aggiorna ad ogni keystroke.
   */
  searchTerm: string = '';

  /**
   * searchChange — @Output()
   * Notifica il padre ogni volta che il testo cambia.
   * Il padre (App) aggiorna il suo state e lo propaga alla lista.
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * onSearchChange()
   * Chiamato dall'event binding (input) nel template.
   * Emette il valore corrente di searchTerm verso il padre.
   *
   * Perché non usiamo direttamente (ngModelChange)?
   * Potremmo, ma il pattern esplicito è più chiaro didatticamente:
   * rende visibile il momento esatto in cui il padre viene notificato.
   */
  onSearchChange(): void {
    // Emit: invia il valore corrente a chiunque ascolti (searchChange)
    this.searchChange.emit(this.searchTerm);
  }

  /**
   * clearSearch()
   * Azzera il campo e notifica il padre con stringa vuota.
   * Il padre aggiorna searchTerm → ProductList mostra tutti i prodotti.
   */
  clearSearch(): void {
    // 1. Azzera lo stato interno del componente
    this.searchTerm = '';
    // 2. Notifica il padre che la ricerca è stata azzerata
    this.searchChange.emit('');
  }
}
