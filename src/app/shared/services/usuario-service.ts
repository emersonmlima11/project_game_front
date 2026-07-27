/**
 * @fileoverview Serviço responsável pelas operações CRUD de usuários.
 * Comunica-se com o endpoint /api/v1/usuarios da API Spring Boot.
 *
 * O token JWT é injetado automaticamente pelo {@link authInterceptor}.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JogoModel, UserModel, UserRequestModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';

/**
 * Serviço singleton para gerenciamento de usuários.
 * Provê métodos para listar, buscar, criar, atualizar e deletar usuários,
 * além de consultar a biblioteca de jogos de um usuário.
 *
 * @example
 * ```typescript
 * this.usuarioService.buscarUsuarios().subscribe(users => console.log(users));
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/usuarios';

  /**
   * Lista todos os usuários cadastrados no sistema.
   * Rota protegida (ADMIN): GET /api/v1/usuarios
   *
   * @returns Observable com array de {@link UserModel}.
   */
  buscarUsuarios(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.apiUrl);
  }

  /**
   * Busca os dados de um usuário específico pelo ID.
   * Rota protegida (autenticado): GET /api/v1/usuarios/:id
   *
   * @param id - Identificador numérico do usuário.
   * @returns Observable com o {@link UserModel} encontrado.
   */
  buscarUsuarioId(id: number): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cadastra um novo usuário no sistema.
   * Rota pública: POST /api/v1/usuarios
   *
   * @param usuario - Dados do usuário conforme {@link UserRequestModel}.
   * @returns Observable com o {@link UserModel} criado (incluindo o ID gerado).
   */
  criarUsuario(usuario: UserRequestModel): Observable<UserModel> {
    return this.http.post<UserModel>(this.apiUrl, usuario);
  }

  /**
   * Atualiza os dados de um usuário existente.
   * Rota protegida (autenticado): PUT /api/v1/usuarios/:id
   *
   * @param id - ID do usuário a ser atualizado.
   * @param usuario - Novos dados conforme {@link UserRequestModel}.
   * @returns Observable com o {@link UserModel} atualizado.
   */
  atualizarUsuario(id: number, usuario: UserRequestModel): Observable<UserModel> {
    return this.http.put<UserModel>(`${this.apiUrl}/${id}`, usuario);
  }

  /**
   * Remove permanentemente um usuário do sistema.
   * Rota protegida (autenticado): DELETE /api/v1/usuarios/:id
   *
   * @param id - ID do usuário a ser removido.
   * @returns Observable void (204 No Content).
   */
  deletarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista os jogos presentes na biblioteca de um usuário específico.
   * Rota protegida (autenticado): GET /api/v1/usuarios/:id/jogos
   *
   * @param id - ID do usuário.
   * @returns Observable com array de {@link JogoModel} representando a biblioteca.
   */
  listarJogosDoUsuario(id: number): Observable<JogoModel[]> {
    return this.http.get<JogoModel[]>(`${this.apiUrl}/${id}/jogos`);
  }

  /**
   * Adiciona saldo à carteira de um usuário via API.
   * Rota protegida: POST /api/v1/usuarios/:id/saldo (e PATCH)
   *
   * @param id - Identificador do usuário.
   * @param valor - Quantia em R$ a ser adicionada.
   * @returns Observable com o {@link UserModel} contendo o novo saldo.
   */
  adicionarSaldo(id: number, valor: number): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.apiUrl}/${id}/saldo`, { valor });
  }
}
