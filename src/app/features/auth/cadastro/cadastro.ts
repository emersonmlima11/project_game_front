import { Component, inject, signal } from '@angular/core';
import { VisualizacaoSenha } from '../../../shared/services/visualizacao-senha';

@Component({
  selector: 'app-cadastro',
  imports: [],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {

  private visualizacao = inject(VisualizacaoSenha)
  tipoSenha = signal('password')

  toggleSenha(): void{
    this.tipoSenha.update(type => this.visualizacao.toogleInputType(type))
  }
}
