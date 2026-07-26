import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Jogo, JogoModel } from '../../../core/models/app.models';
import { JogoService } from '../../../shared/services/jogo-service';
export type AdminTab = 'cadastrar-jogo' | 'gerenciar-jogos' |'cadastrar-usuario' | 'historico-vendas';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})

export class User {

  private jogosServices = inject(JogoService)

  abaAtiva = signal<AdminTab>('cadastrar-jogo');

  menuMobileAberto = signal(false);

  imagemPreviewUrl = signal<string | null>(null);

  jogoParaEditar = signal<JogoModel | null>(null);
  jogoParaRemover = signal<JogoModel | null>(null);

  jogos = signal<JogoModel[]>([
    { id: 1, nome: 'Cyberpunk 2077', preco: 199.90, categoria: "", capaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', descricao: "" },
    { id: 2, nome: 'Elden Ring', preco: 249.00, categoria: "", capaUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500', descricao: "" }
  ]);

  constructor(private router: Router){
    this.jogosServices.buscarJogos().subscribe((res: JogoModel[]) => {
    this.jogos.set(res);
    })
    
  }

  mudarAba(aba: AdminTab):void{
    this.abaAtiva.set(aba);
    this.menuMobileAberto.set(false);
  }

  abrirModalRemover(jogo: JogoModel): void {
    this.jogoParaRemover.set(jogo);
  }

  confirmarRemocao(): void {
    const jogo = this.jogoParaRemover();
    if (jogo) {
      this.jogos.update(lista => lista.filter(j => j.id !== jogo.id));
      alert(`Jogo "${jogo.nome}" removido com sucesso!`);
      this.jogoParaRemover.set(null);
    }
  }

  abrirModalEditar(jogo: JogoModel): void {
    // Passamos uma cópia do objeto para não alterar o sinal antes de salvar
    this.jogoParaEditar.set({ ...jogo });
  }

  salvarEdicao(nome: string, preco: string): void {
    const jogoAtual = this.jogoParaEditar();
    if (jogoAtual) {
      this.jogos.update(lista =>
        lista.map(j => j.id === jogoAtual.id ? { ...j, nome, preco: parseFloat(preco) || j.preco } : j)
      );
      alert('Informações do jogo atualizadas!');
      this.jogoParaEditar.set(null);
    }
  }

  onImagemSelecionada(event: Event): void{
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        this.imagemPreviewUrl.set(reader.result as string);
      };
      
      reader.readAsDataURL(file);
    }
  }

  sair(): void {
    this.router.navigate(['/login']);
  }

}
