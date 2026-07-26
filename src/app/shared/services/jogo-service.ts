/**
 * @fileoverview Serviço responsável pelas operações CRUD de jogos no catálogo da loja.
 * Comunica-se com o endpoint /api/v1/jogos da API Spring Boot.
 *
 * O token JWT é injetado automaticamente pelo {@link authInterceptor},
 * portanto não é necessário configurar headers manualmente.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JogoModel, JogoRequestModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';

/**
 * Serviço singleton para gerenciamento de jogos.
 * Provê métodos para listar, buscar, criar, atualizar e deletar jogos.
 *
 * @example
 * ```typescript
 * this.jogoService.buscarJogos().subscribe(jogos => console.log(jogos));
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/jogos';

  /**
   * Retorna a lista completa de jogos disponíveis no catálogo.
   * Rota pública: GET /api/v1/jogos
   *
   * @returns Observable com array de {@link JogoModel}.
   */
  buscarJogos(): Observable<JogoModel[]> {
    return this.http.get<JogoModel[]>(this.apiUrl);
  }

  /**
   * Busca os detalhes de um jogo específico pelo ID.
   * Rota pública: GET /api/v1/jogos/:id
   *
   * @param id - Identificador numérico do jogo.
   * @returns Observable com o {@link JogoModel} encontrado.
   */
  buscarJogoPorId(id: number): Observable<JogoModel> {
    return this.http.get<JogoModel>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cadastra um novo jogo no catálogo.
   * Rota protegida (ADMIN): POST /api/v1/jogos
   *
   * @param jogo - Dados do jogo a ser criado (conforme {@link JogoRequestModel}).
   * @returns Observable com o {@link JogoModel} criado (incluindo o ID gerado).
   */
  salvarJogo(jogo: JogoRequestModel): Observable<JogoModel> {
    return this.http.post<JogoModel>(this.apiUrl, jogo);
  }

  /**
   * Atualiza os dados de um jogo existente no catálogo.
   * Rota protegida (ADMIN): PUT /api/v1/jogos/:id
   *
   * @param id - ID do jogo a ser atualizado.
   * @param jogo - Novos dados do jogo (conforme {@link JogoRequestModel}).
   * @returns Observable com o {@link JogoModel} atualizado.
   */
  atualizarJogo(id: number, jogo: JogoRequestModel): Observable<JogoModel> {
    return this.http.put<JogoModel>(`${this.apiUrl}/${id}`, jogo);
  }

  /**
   * Remove permanentemente um jogo do catálogo.
   * Rota protegida (ADMIN): DELETE /api/v1/jogos/:id
   *
   * @param id - ID do jogo a ser removido.
   * @returns Observable void (204 No Content).
   */
  deletarJogo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
