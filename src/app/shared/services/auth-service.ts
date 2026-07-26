/**
 * @fileoverview Serviço de autenticação responsável pelo login, logout e
 * gerenciamento do estado do usuário logado na aplicação.
 *
 * Fluxo de login:
 * 1. POST /api/v1/auth/login → recebe o token JWT
 * 2. Armazena o token no localStorage
 * 3. GET /api/v1/auth/me (com token no header) → recebe os dados do usuário
 * 4. Armazena os dados do usuário no localStorage e atualiza o signal global
 *
 * O {@link authInterceptor} injeta automaticamente o token em todas as requisições.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { UserModel } from '../../core/models/app.models';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, switchMap, catchError, throwError } from 'rxjs';

/** Chave usada para persistir o token JWT no localStorage */
const TOKEN_KEY = 'token';
/** Chave usada para persistir os dados do usuário no localStorage */
const USUARIO_KEY = 'usuario_logado';

/**
 * Estrutura da resposta do endpoint POST /api/v1/auth/login.
 * A API retorna apenas o token JWT — os dados do usuário são obtidos separadamente via /me.
 */
export interface LoginResponse {
  token: string;
}

/**
 * Serviço singleton de autenticação.
 * Gerencia o ciclo de vida da sessão do usuário no frontend.
 *
 * @example
 * ```typescript
 * // No componente de login:
 * this.authService.login({ email: 'admin@mail.com', senha: 'admin123' }).subscribe({
 *   next: (usuario) => {
 *     if (usuario.admin) this.router.navigate(['/admin']);
 *   }
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  /**
   * Signal reativo com os dados do usuário ativo na sessão.
   * Emite `null` quando nenhum usuário está logado.
   * Inicializado a partir do localStorage para persistir entre recarregamentos de página.
   */
  usuarioAtual = signal<UserModel | null>(this.obterUsuarioDoStorage());

  /**
   * Computed signal que indica se existe um usuário autenticado.
   * Útil para guards de rota e exibição condicional de UI.
   */
  isLoggedIn = computed(() => this.usuarioAtual() !== null);

  /**
   * Computed signal que indica se o usuário logado é administrador.
   * Retorna `false` se nenhum usuário estiver logado.
   */
  isAdmin = computed(() => this.usuarioAtual()?.admin === true);

  /**
   * Realiza o login do usuário na plataforma.
   *
   * Executa duas requisições sequenciais:
   * 1. POST /login com as credenciais → recebe o token JWT
   * 2. GET /me com o token → recebe os dados completos do usuário
   *
   * Armazena tanto o token quanto os dados do usuário no localStorage
   * e atualiza o signal {@link usuarioAtual}.
   *
   * @param credenciais - Objeto com `email` e `senha` do usuário.
   * @returns Observable que emite o {@link UserModel} do usuário logado.
   * @throws Erro HTTP 401 se as credenciais forem inválidas.
   */
  login(credenciais: { email: string; senha: string }): Observable<UserModel> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciais).pipe(
      tap((res) => {
        // Passo 1: Salva o token imediatamente para que o interceptor
        // o inclua no header da próxima requisição (GET /me)
        localStorage.setItem(TOKEN_KEY, res.token);
      }),
      // Passo 2: Encadeia a requisição GET /me para obter os dados do usuário
      switchMap(() => this.buscarUsuarioLogado()),
      tap((usuario) => {
        // Passo 3: Persiste os dados do usuário e atualiza o signal global
        localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
        this.usuarioAtual.set(usuario);
      }),
      catchError((error) => {
        // Em caso de falha em qualquer etapa, limpa dados parciais
        this.limparDadosSessao();
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca os dados do usuário autenticado no backend.
   * Requer que o token JWT já esteja salvo no localStorage
   * (o interceptor o envia automaticamente).
   *
   * @returns Observable com os dados do {@link UserModel} autenticado.
   */
  buscarUsuarioLogado(): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/me`);
  }

  /**
   * Encerra a sessão do usuário.
   * Remove token e dados do localStorage, reseta o signal e redireciona para /login.
   */
  logout(): void {
    this.limparDadosSessao();
    this.router.navigate(['/login']);
  }

  /**
   * Recupera os dados do usuário persistidos no localStorage.
   * Chamado na inicialização do serviço para restaurar a sessão após recarregar a página.
   *
   * @returns O {@link UserModel} armazenado ou `null` se não houver dados válidos.
   */
  private obterUsuarioDoStorage(): UserModel | null {
    // Verifica se está rodando no navegador (proteção para SSR)
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const userJson = localStorage.getItem(USUARIO_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Remove todos os dados de sessão do localStorage e reseta o signal.
   * Método interno usado por {@link logout} e no tratamento de erros do {@link login}.
   */
  private limparDadosSessao(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioAtual.set(null);
  }
}
