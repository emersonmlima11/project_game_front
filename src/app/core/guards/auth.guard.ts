/**
 * @fileoverview Guards de rota para proteção das áreas restritas da aplicação.
 *
 * Dois guards são exportados:
 * - {@link authGuard}: Exige que o usuário esteja autenticado (qualquer role).
 * - {@link adminGuard}: Exige que o usuário seja administrador (admin === true).
 *
 * Ambos redirecionam para /login se a condição não for atendida.
 *
 * @remarks Os guards verificam diretamente o localStorage além do signal
 * do AuthService para suportar SSR (onde o signal é inicializado como null
 * no servidor, mas os dados estão disponíveis no browser via localStorage).
 */
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth-service';

/**
 * Guard que protege rotas que exigem autenticação.
 * Verifica se existe um usuário logado no signal do AuthService
 * ou no localStorage (para suportar SSR/hidratação).
 *
 * @example
 * ```typescript
 * { path: 'cliente', component: Client, canActivate: [authGuard] }
 * ```
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), permite a navegação — a verificação real acontecerá no cliente
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Verifica se o signal já tem o usuário OU se o localStorage tem dados
  // (o signal pode estar null durante a hidratação, mas o localStorage persiste)
  if (authService.isLoggedIn()) {
    return true;
  }

  // Fallback: verifica localStorage diretamente (caso o signal não tenha sido atualizado ainda)
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('usuario_logado');
  if (token && userData) {
    // Restaura o signal do AuthService com os dados do localStorage
    try {
      const usuario = JSON.parse(userData);
      authService.usuarioAtual.set(usuario);
      return true;
    } catch {
      // Dados corrompidos — limpa e redireciona
    }
  }

  // Usuário não autenticado — redireciona para o login
  router.navigate(['/login']);
  return false;
};

/**
 * Guard que protege rotas exclusivas de administradores.
 * Verifica se o usuário logado possui `admin === true`.
 *
 * @example
 * ```typescript
 * { path: 'admin', component: User, canActivate: [authGuard, adminGuard] }
 * ```
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), permite — verificação real no cliente
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Verifica se é admin pelo signal
  if (authService.isAdmin()) {
    return true;
  }

  // Fallback: verifica localStorage diretamente
  const userData = localStorage.getItem('usuario_logado');
  if (userData) {
    try {
      const usuario = JSON.parse(userData);
      if (usuario.admin === true) {
        authService.usuarioAtual.set(usuario);
        return true;
      }
    } catch {
      // Dados corrompidos
    }
  }

  // Usuário não é admin — redireciona para o login
  router.navigate(['/login']);
  return false;
};
