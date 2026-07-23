import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VisualizacaoSenha } from '../../../shared/services/visualizacao-senha';
@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private router = inject(Router); // Usando a função inject() moderna do Angular
  private visualizacao = inject(VisualizacaoSenha);

  tipoSenha = signal('password');

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
