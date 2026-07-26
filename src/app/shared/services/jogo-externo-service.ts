/**
 * @fileoverview Serviço para busca de jogos na API externa (IGDB) via backend.
 * Comunica-se com o endpoint /api/v1/jogos/externo da API Spring Boot.
 *
 * Usado no painel admin para buscar automaticamente a capa de um jogo
 * ao informar o nome durante o cadastro.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JogoBuscaExternaModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';

/**
 * Serviço singleton para integração com a API externa de jogos (IGDB).
 * As requisições são proxiadas pelo backend para proteger as credenciais da API.
 *
 * @example
 * ```typescript
 * this.jogoExternoService.buscarPorNome('Mario').subscribe(resultados => {
 *   // resultados = [{ nome: 'Super Mario 64', urlImagem: 'https://...' }]
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class JogoExternoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/jogos/externo';

  /**
   * Busca jogos pelo nome na API externa IGDB.
   * Rota: GET /api/v1/jogos/externo/buscar?nome=...
   *
   * @param nome - Termo de busca (nome parcial ou completo do jogo).
   * @returns Observable com array de {@link JogoBuscaExternaModel} contendo
   *          nome e URL da capa dos jogos encontrados.
   */
  buscarPorNome(nome: string): Observable<JogoBuscaExternaModel[]> {
    return this.http.get<JogoBuscaExternaModel[]>(`${this.apiUrl}/buscar`, {
      params: { nome }
    });
  }
}
