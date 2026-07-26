/**
 * @fileoverview Serviço utilitário para alternar a visibilidade do campo de senha.
 * Alterna entre os tipos 'password' (oculto) e 'text' (visível) do input HTML.
 */
import { Injectable } from '@angular/core';

/**
 * Serviço singleton para controle de visibilidade do campo de senha.
 *
 * @example
 * ```typescript
 * tipoSenha = signal('password');
 * toggleSenha(): void {
 *   this.tipoSenha.update(type => this.visualizacao.toogleInputType(type));
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class VisualizacaoSenha {

  /**
   * Alterna o tipo do input de senha entre 'password' e 'text'.
   *
   * @param type - Tipo atual do input ('password' ou 'text').
   * @returns O tipo oposto: 'text' se era 'password', 'password' se era 'text'.
   */
  toogleInputType(type: string): string {
    return type === 'password' ? 'text' : 'password';
  }
}
