/**
 * @fileoverview Definição das rotas da aplicação GameStore.
 *
 * Rotas públicas:
 * - / (Home): Landing page
 * - /login: Tela de login
 * - /cadastro: Tela de registro de novo usuário
 *
 * Rotas protegidas:
 * - /admin: Painel administrativo (requer login + role admin)
 * - /cliente: Painel do cliente (requer login)
 */
import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Cadastro } from './features/auth/cadastro/cadastro';
import { User } from './features/users/user/user';
import { Client } from './features/users/client/client';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  /** Landing page pública com apresentação da plataforma */
  { path: '', component: Home },

  /** Tela de login — rota pública */
  { path: 'login', component: Login },

  /** Tela de cadastro — acessível também via /login/cadastro */
  { path: 'login/cadastro', component: Cadastro },
  { path: 'cadastro', component: Cadastro },

  /**
   * Painel administrativo — protegido por authGuard (exige login)
   * e adminGuard (exige role admin)
   */
  { path: 'admin', component: User, canActivate: [authGuard, adminGuard] },

  /** Painel do cliente — protegido por authGuard (exige login) */
  { path: 'cliente', component: Client, canActivate: [authGuard] },

  /** Redireciona rotas inexistentes para a Home */
  { path: '**', redirectTo: '' }
];
