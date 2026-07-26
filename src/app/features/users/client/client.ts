import { Component, signal, computed, inject} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Jogo, JogoModel } from '../../../core/models/app.models';
export type ClienteTab = 'vitrine' | 'meus-dados';
import { JogoService } from '../../../shared/services/jogo-service';

@Component({
  selector: 'app-client',
  imports: [CommonModule],
  templateUrl: './client.html',
  styleUrl: './client.scss',
})


export class Client {

  private jogoService = inject(JogoService)

  abaAtiva = signal<ClienteTab>('vitrine');
  saldo = signal<number>(4000.00);
  menuMobileAberto = signal(false);
  nomeUsuario = signal('Emerson Matias');
  saldoUsuario = signal<number>(4000.00);
  termoBusca = signal<string>('');
  
  // 2. Use a interface Jogo oficial
  jogos = signal<JogoModel[]>([
    { 
      id: 1, 
      nome: 'Cyberpunk 2077', 
      preco: 199.90, 
      categoria: "tal", // Corresponde ao enum TipoJogo (ex: RPG)
      capaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500', 
      descricao: "asdasdasdada"
    },
    { 
      id: 2, 
      nome: 'Elden Ring', 
      preco: 249.00, 
      categoria: "", // Corresponde ao enum TipoJogo (ex: ACAO)
      capaUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500' ,
      descricao: ""
    }
  ]);


  jogosFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    
    // Se a busca estiver vazia, retorna todos os jogos
    if (!termo) {
      return this.jogos();
    }
    
    // Filtra pelo nome do jogo ignorando maiúsculas/minúsculas
    return this.jogos().filter(jogo => 
      jogo.nome.toLowerCase().includes(termo)
    );
  });

  // Modal de Detalhes
  jogoSelecionado = signal<JogoModel | null>(null);
  constructor(private router: Router) {}

  mudarAba(aba: ClienteTab): void {
    this.abaAtiva.set(aba);
    this.menuMobileAberto.set(false);
  }

  abrirDetalhes(jogo: JogoModel): void {
    this.jogoSelecionado.set(jogo);
  }

  fecharModal(): void {
    this.jogoSelecionado.set(null);
  }

  comprarJogo(jogo: JogoModel): void {
    if (this.saldo() >= jogo.preco) {
      this.saldo.update(s => s - jogo.preco);
      alert(`Você comprou "${jogo.nome}" com sucesso! 🎉`);
      this.fecharModal();
    } else {
      alert('Saldo insuficiente para realizar essa compra!');
    }
  }

  adicionarSaldo(valorInput: string): void {
    const valor = parseFloat(valorInput);
    if (!isNaN(valor) && valor > 0) {
      this.saldo.update(s => s + valor);
      alert(`R$ ${valor.toFixed(2)} adicionados ao seu saldo com sucesso!`);
    } else {
      alert('Informe um valor válido maior que zero.');
    }
  }

  sair(): void {
    this.router.navigate(['/login']);
  }
}
