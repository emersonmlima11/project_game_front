import { Component, OnInit, inject, signal } from '@angular/core';
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
  private authService = inject(AuthService)
  private router = inject(Router); // Usando a função inject() moderna do Angular
  private visualizacao = inject(VisualizacaoSenha);

  email = signal('');
  senha = signal('');
  mensagemErro = signal('');

  tipoSenha = signal('password');

  fazerLogin(): void {
    const emailVal = this.email().trim();
    const senhaVal = this.senha().trim();
    
    if (!emailVal || !senhaVal) {
      this.mensagemErro.set('Preencha todos os campos.');
      return;
    }

    this.authService.login({email: emailVal, senha:senhaVal}).subscribe({
      next: (res) => {
        // Redireciona com base nas permissões do usuário vindo da API
        if (senhaVal == "admin123") {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: () => {
        this.mensagemErro.set('E-mail ou senha inválidos!');
      }
    });
  }

  // Recebemos os valores diretamente como parâmetros da função!
  executarLogin(nome: string, senha: string): void {
    if (nome === 'admin' && senha === 'admin') {
      this.router.navigate(['/admin']);
    } else if (nome === 'client' && senha === 'client') {
      this.router.navigate(['/cliente']);
    } else {
      alert('Usuário ou senha incorretos!');
    }
  }

  toggleSenha(): void {
    this.tipoSenha.update(type => this.visualizacao.toogleInputType(type));
  }
}
