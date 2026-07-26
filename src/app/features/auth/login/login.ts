/**
 * @fileoverview Componente da tela de login da GameStore.
 *
 * Fluxo:
 * 1. Usuário preenche email e senha
 * 2. Ao submeter, chama {@link AuthService.login}
 * 3. O AuthService faz POST /login → GET /me e retorna o UserModel
 * 4. Com base no campo `admin` do usuário, redireciona para /admin ou /cliente
 *
 * Estados visuais:
 * - Loading: Botão desabilitado com texto "Entrando..."
 * - Erro: Mensagem em vermelho acima do formulário
 */
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VisualizacaoSenha } from '../../../shared/services/visualizacao-senha';
import { AuthService } from '../../../shared/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private visualizacao = inject(VisualizacaoSenha);

  /** Valor do campo de email vinculado ao input */
  email = signal('');
  /** Valor do campo de senha vinculado ao input */
  senha = signal('');
  /** Mensagem de erro exibida quando o login falha */
  mensagemErro = signal('');
  /** Controla o tipo do input de senha (password/text) */
  tipoSenha = signal('password');
  /** Indica se a requisição de login está em andamento (para feedback visual) */
  carregando = signal(false);

  /**
   * Executa o fluxo de login com a API.
   *
   * Valida os campos, chama o AuthService.login() e redireciona
   * o usuário para o painel apropriado com base na sua role.
   *
   * Regra de negócio:
   * - Se `usuario.admin === true` → redireciona para /admin
   * - Se `usuario.admin === false` → redireciona para /cliente
   */
  fazerLogin(): void {
    const emailVal = this.email().trim();
    const senhaVal = this.senha().trim();

    // Validação local: ambos os campos são obrigatórios
    if (!emailVal || !senhaVal) {
      this.mensagemErro.set('Preencha todos os campos.');
      return;
    }

    // Limpa erros anteriores e ativa o estado de carregamento
    this.mensagemErro.set('');
    this.carregando.set(true);

    this.authService.login({ email: emailVal, senha: senhaVal }).subscribe({
      next: (usuario) => {
        this.carregando.set(false);

        // Regra de negócio: redireciona com base na role do usuário
        // retornada pela API (campo admin do UserResponseDTO)
        if (usuario.admin) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: () => {
        this.carregando.set(false);
        this.mensagemErro.set('E-mail ou senha inválidos!');
      }
    });
  }

  /**
   * Alterna a visibilidade do campo de senha entre texto e pontos.
   */
  toggleSenha(): void {
    this.tipoSenha.update(type => this.visualizacao.toogleInputType(type));
  }
}
