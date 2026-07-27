/**
 * @fileoverview Componente do painel do cliente da GameStore.
 *
 * Funcionalidades:
 * 1. **Vitrine da Loja**: Exibe todos os jogos do catálogo com busca por nome,
 *    detalhes via modal e compra integrada à API.
 * 2. **Meus Dados**: Exibe nome e saldo do usuário logado com opção de adicionar saldo.
 *
 * Todas as operações fazem requisições reais à API Spring Boot.
 * Os dados do usuário logado vêm do {@link AuthService.usuarioAtual}.
 */
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JogoModel, CompraRequestModel } from '../../../core/models/app.models';
import { JogoService } from '../../../shared/services/jogo-service';
import { CompraService } from '../../../shared/services/compra-service';
import { AuthService } from '../../../shared/services/auth-service';
import { UsuarioService } from '../../../shared/services/usuario-service';

/** Tipos possíveis das abas do painel cliente */
export type ClienteTab = 'vitrine' | 'biblioteca' | 'meus-dados';

@Component({
  selector: 'app-client',
  imports: [],
  templateUrl: './client.html',
  styleUrl: './client.scss',
})
export class Client implements OnInit {
  // ─────────────────────────────────────────────────────────
  // INJEÇÃO DE DEPENDÊNCIAS
  // ─────────────────────────────────────────────────────────
  private jogoService = inject(JogoService);
  private compraService = inject(CompraService);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  // ─────────────────────────────────────────────────────────
  // ESTADO DO PAINEL
  // ─────────────────────────────────────────────────────────

  /** Aba ativa no painel do cliente */
  abaAtiva = signal<ClienteTab>('vitrine');
  /** Controla visibilidade do menu em dispositivos móveis */
  menuMobileAberto = signal(false);
  /** Termo de busca para filtrar jogos na vitrine */
  termoBusca = signal<string>('');
  /** Mensagem de feedback (sucesso/info) */
  mensagemFeedback = signal('');
  /** Mensagem de erro */
  mensagemErro = signal('');

  // ─────────────────────────────────────────────────────────
  // DADOS DO USUÁRIO (vêm do AuthService)
  // ─────────────────────────────────────────────────────────

  /**
   * Nome do usuário logado, extraído do signal do AuthService.
   * Retorna 'Usuário' como fallback se os dados não estiverem disponíveis.
   */
  nomeUsuario = computed(() => this.authService.usuarioAtual()?.nome ?? 'Usuário');

  /**
   * Saldo atual do usuário logado (em R$).
   * Retorna 0 como fallback.
   */
  saldoUsuario = computed(() => this.authService.usuarioAtual()?.saldo ?? 0);

  /**
   * ID do usuário logado, necessário para as requisições de compra.
   */
  private userId = computed(() => this.authService.usuarioAtual()?.idUser ?? 0);

  // ─────────────────────────────────────────────────────────
  // ESTADO: VITRINE
  // ─────────────────────────────────────────────────────────

  /** Lista de jogos carregados da API */
  jogos = signal<JogoModel[]>([]);
  /** Indica se os jogos estão sendo carregados */
  carregandoJogos = signal(false);
  /** Jogo selecionado para ver detalhes (modal) */
  jogoSelecionado = signal<JogoModel | null>(null);
  /** Indica se a compra está em andamento */
  comprando = signal(false);

  /**
   * Computed signal que filtra a lista de jogos pelo termo de busca.
   * Se a busca estiver vazia, retorna todos os jogos.
   */
  jogosFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase().trim();
    if (!termo) {
      return this.jogos();
    }
    return this.jogos().filter(jogo =>
      jogo.nome.toLowerCase().includes(termo)
    );
  });

  // ─────────────────────────────────────────────────────────
  // ESTADO: MINHA BIBLIOTECA
  // ─────────────────────────────────────────────────────────

  /** Lista de jogos adquiridos pelo usuário logado */
  bibliotecaJogos = signal<JogoModel[]>([]);
  /** Indica se a biblioteca de jogos está sendo carregada */
  carregandoBiblioteca = signal(false);
  /** Termo de busca para filtrar jogos na biblioteca*/
  termoBuscaBiblioteca = signal<string>('');

  /**
   * Computed signal que filtra a lista da biblioteca pelo termo de busca.
   */
  bibliotecaFiltrada = computed(() => {
    const termo = this.termoBuscaBiblioteca().toLowerCase().trim();
    if (!termo) {
      return this.bibliotecaJogos();
    }
    return this.bibliotecaJogos().filter(jogo =>
      jogo.nome.toLowerCase().includes(termo)
    );
  });

  /**
   * Verifica se o usuário já possui um determinado jogo na sua biblioteca.
   * @param jogoId - ID do jogo a ser verificado.
   */
  jaPossuiJogo(jogoId: number): boolean {
    return this.bibliotecaJogos().some(j => j.id === jogoId);
  }

  // ─────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────

  /**
   * Carrega a lista de jogos da vitrine e da biblioteca ao inicializar o componente.
   */
  ngOnInit(): void {
    this.carregarJogos();
    this.carregarBiblioteca();
  }

  // ─────────────────────────────────────────────────────────
  // NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  /**
   * Troca a aba ativa e fecha o menu mobile.
   * @param aba - Identificador da aba destino.
   */
  mudarAba(aba: ClienteTab): void {
    this.abaAtiva.set(aba);
    this.menuMobileAberto.set(false);
    this.limparMensagens();
  }

  // ─────────────────────────────────────────────────────────
  // VITRINE
  // ─────────────────────────────────────────────────────────

  /**
   * Carrega a lista completa de jogos do catálogo via API.
   * Rota pública: GET /api/v1/jogos
   */
  private carregarJogos(): void {
    this.carregandoJogos.set(true);
    this.jogoService.buscarJogos().subscribe({
      next: (jogos) => {
        this.jogos.set(jogos);
        this.carregandoJogos.set(false);
      },
      error: () => {
        this.carregandoJogos.set(false);
        this.mensagemErro.set('Erro ao carregar jogos da vitrine.');
      }
    });
  }

  /**
   * Abre o modal de detalhes de um jogo.
   * @param jogo - Jogo selecionado para visualizar detalhes.
   */
  abrirDetalhes(jogo: JogoModel): void {
    this.jogoSelecionado.set(jogo);
  }

  /**
   * Fecha o modal de detalhes/compra.
   */
  fecharModal(): void {
    this.jogoSelecionado.set(null);
  }

  /**
   * Realiza a compra de um jogo via API.
   *
   * Regra de negócio:
   * 1. Envia POST /api/v1/compras com { userId, jogoId }
   * 2. O backend valida o saldo e registra a transação
   * 3. Após sucesso, recarrega os dados do usuário para atualizar o saldo
   *
   * @param jogo - Jogo a ser comprado.
   */
  comprarJogo(jogo: JogoModel): void {
    const currentUserId = this.userId();
    if (!currentUserId) {
      this.mensagemErro.set('Sessão expirada. Faça login novamente.');
      return;
    }

    this.comprando.set(true);
    this.limparMensagens();

    const compraRequest: CompraRequestModel = {
      userId: currentUserId,
      jogoId: jogo.id
    };

    this.compraService.realizarCompra(compraRequest).subscribe({
      next: () => {
        this.comprando.set(false);
        this.mensagemFeedback.set(`Você comprou "${jogo.nome}" com sucesso! 🎉`);
        this.fecharModal();

        // Recarrega os dados do usuário para atualizar o saldo exibido
        this.authService.buscarUsuarioLogado().subscribe({
          next: (usuario) => {
            this.authService.usuarioAtual.set(usuario);
            localStorage.setItem('usuario_logado', JSON.stringify(usuario));
          }
        });
        // Atualiza a biblioteca de jogos do usuário instantaneamente
        this.carregarBiblioteca();
      },
      error: (err) => {
        this.comprando.set(false);
        // Trata mensagens de erro do backend (ex: saldo insuficiente, jogo já comprado)
        const mensagem = err.error?.message || err.error || 'Erro ao realizar compra.';
        this.mensagemErro.set(typeof mensagem === 'string' ? mensagem : 'Erro ao realizar compra.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // MINHA BIBLIOTECA
  // ─────────────────────────────────────────────────────────

  /**
   * Carrega a biblioteca de jogos adquiridos pelo usuário logado via API.
   * Rota protegida: GET /api/v1/usuarios/:id/jogos
   */
  private carregarBiblioteca(): void {
    const currentUserId = this.userId();
    if (!currentUserId) return;

    this.carregandoBiblioteca.set(true);
    this.usuarioService.listarJogosDoUsuario(currentUserId).subscribe({
      next: (jogos) => {
        this.bibliotecaJogos.set(jogos);
        this.carregandoBiblioteca.set(false);
      },
      error: () => {
        this.carregandoBiblioteca.set(false);
        this.mensagemErro.set('Erro ao carregar sua biblioteca de jogos.');
      }
    });
  }

  /**
   * Ação ao clicar em "Jogar" num jogo da biblioteca.
   * Exibe mensagem interativa de lançamento do jogo.
   * @param jogo - Jogo selecionado na biblioteca.
   */
  jogarJogo(jogo: JogoModel): void {
    this.mensagemFeedback.set(`Iniciando "${jogo.nome}"... Boa diversão! 🎮`);
  }

  // ─────────────────────────────────────────────────────────
  // ADICIONAR SALDO (MEUS DADOS)
  // ─────────────────────────────────────────────────────────
  valorAdicionarSaldo = signal<number>(50);
  adicionandoSaldo = signal<boolean>(false);
  mensagemSaldo = signal<string>('');
  mensagemErroSaldo = signal<string>('');

  /**
   * Adiciona saldo à carteira do usuário logado.
   * Rota protegida: PATCH /api/v1/usuarios/:id/saldo
   * @param valorCustom Optional: valor a ser adicionado
   */
  adicionarSaldoCarteira(valorCustom?: number): void {
    const currentUserId = this.userId();
    if (!currentUserId) return;

    const valor = valorCustom !== undefined ? Number(valorCustom) : Number(this.valorAdicionarSaldo());
    if (isNaN(valor) || valor <= 0) {
      this.mensagemErroSaldo.set('Informe um valor válido maior que zero.');
      return;
    }

    this.mensagemErroSaldo.set('');
    this.mensagemSaldo.set('');
    this.adicionandoSaldo.set(true);

    this.usuarioService.adicionarSaldo(currentUserId, valor).subscribe({
      next: (usuarioAtualizado) => {
        this.adicionandoSaldo.set(false);
        this.authService.usuarioAtual.set(usuarioAtualizado);
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioAtualizado));
        this.mensagemSaldo.set(`Saldo de R$ ${valor.toFixed(2)} adicionado com sucesso! 🎉`);
        setTimeout(() => this.mensagemSaldo.set(''), 5000);
      },
      error: (err) => {
        this.adicionandoSaldo.set(false);
        const errMsg = err.error?.message || 'Erro ao adicionar saldo.';
        this.mensagemErroSaldo.set(errMsg);
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────

  /**
   * Encerra a sessão e redireciona para o login.
   */
  sair(): void {
    this.authService.logout();
  }

  /**
   * Limpa as mensagens de feedback e erro.
   */
  private limparMensagens(): void {
    this.mensagemFeedback.set('');
    this.mensagemErro.set('');
  }
}
