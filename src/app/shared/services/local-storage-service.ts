/**
 * @fileoverview Serviço utilitário para operações de persistência no localStorage.
 * Abstrai o acesso direto ao localStorage para facilitar testes unitários
 * e adicionar proteção contra SSR (Server-Side Rendering).
 */
import { Injectable } from '@angular/core';

/**
 * Serviço singleton para manipulação do localStorage do navegador.
 *
 * @example
 * ```typescript
 * this.storageService.setItem('chave', JSON.stringify(dados));
 * const dados = this.storageService.getItem('chave');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {

  /**
   * Armazena um valor no localStorage associado à chave fornecida.
   *
   * @param key - Chave identificadora do item.
   * @param value - Valor a ser armazenado (deve ser string; use JSON.stringify para objetos).
   */
  setItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Recupera um valor armazenado no localStorage pela chave.
   *
   * @param key - Chave identificadora do item.
   * @returns O valor armazenado como string, ou `null` se a chave não existir.
   */
  getItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  /**
   * Remove um item específico do localStorage.
   *
   * @param key - Chave identificadora do item a ser removido.
   */
  removeItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
