/**
 * @fileoverview Componente da tela de cadastro de novos usuários.
 *
 * Fluxo:
 * 1. Usuário preenche nome, email, senha e saldo inicial
 * 2. Ao submeter, chama {@link UsuarioService.criarUsuario} (POST /api/v1/usuarios)
 * 3. Em caso de sucesso, exibe mensagem e redireciona para /login
 * 4. Em caso de erro (ex: email duplicado), exibe mensagem de erro
 *
 * A rota POST /api/v1/usuarios é pública no backend, não exige token.
 */
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VisualizacaoSenha } from '../../../shared/services/visualizacao-senha';
import { UsuarioService } from '../../../shared/services/usuario-service';
import { UserRequestModel } from '../../../core/models/app.models';

@Component({
  selector: 'app-cadastro',
  imports: [RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  private visualizacao = inject(VisualizacaoSenha);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  /** Valor do campo nome vinculado ao input */
  nome = signal('');
  /** Valor do campo email vinculado ao input */
  email = signal('');
  /** Valor do campo senha vinculado ao input */
  senha = signal('');
  /** Valor do campo saldo vinculado ao input */
  saldo = signal('');
  /** Controla o tipo do input de senha (password/text) */
  tipoSenha = signal('password');
  /** Mensagem de erro exibida quando o cadastro falha */
  mensagemErro = signal('');
  /** Mensagem de sucesso exibida após cadastro realizado */
  mensagemSucesso = signal('');
  /** Indica se a requisição está em andamento (para feedback visual) */
  carregando = signal(false);

  /**
   * Alterna a visibilidade do campo de senha entre texto e pontos.
   */
  toggleSenha(): void {
    this.tipoSenha.update(type => this.visualizacao.toogleInputType(type));
  }

  /**
   * Realiza o cadastro do novo usuário na API.
   *
   * Regra de negócio:
   * - Todos os campos são obrigatórios
   * - Senha mínima de 6 caracteres (validado também no backend)
   * - Saldo deve ser um número >= 0
   * - Email deve ser único (validado no backend — retorna erro 409 se duplicado)
   * - O campo isAdmin é sempre false no registro (controlado pelo backend)
   */
  cadastrar(): void {
    const nomeVal = this.nome().trim();
    const emailVal = this.email().trim();
    const senhaVal = this.senha().trim();
    const saldoVal = parseFloat(this.saldo());

    // Validação local dos campos obrigatórios
    if (!nomeVal || !emailVal || !senhaVal) {
      this.mensagemErro.set('Preencha todos os campos obrigatórios.');
      return;
    }

    if (senhaVal.length < 6) {
      this.mensagemErro.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (isNaN(saldoVal) || saldoVal < 0) {
      this.mensagemErro.set('Informe um saldo inicial válido (mínimo R$ 0,00).');
      return;
    }

    // Limpa mensagens anteriores e ativa loading
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
    this.carregando.set(true);

    // Monta o DTO conforme o backend espera (UserRequestDTO)
    const novoUsuario: UserRequestModel = {
      nome: nomeVal,
      email: emailVal,
      senha: senhaVal,
      saldo: saldoVal
    };

    this.usuarioService.criarUsuario(novoUsuario).subscribe({
      next: () => {
        this.carregando.set(false);
        this.mensagemSucesso.set('Conta criada com sucesso! Redirecionando...');

        // Redireciona para o login após 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.carregando.set(false);

        // Trata erros específicos da API
        if (err.status === 409 || err.status === 400) {
          this.mensagemErro.set(
            err.error?.message || err.error || 'Este email já está cadastrado.'
          );
        } else {
          this.mensagemErro.set('Erro ao criar conta. Tente novamente.');
        }
      }
    });
  }
}
