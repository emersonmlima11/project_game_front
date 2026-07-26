/**
 * @fileoverview Componente do painel administrativo da GameStore.
 *
 * Funcionalidades (abas):
 * 1. **Cadastrar Jogo**: Formulário para adicionar jogos ao catálogo via API.
 *    Inclui busca automática de capa na IGDB ao informar o nome do jogo.
 * 2. **Gerenciar Jogos**: Lista todos os jogos com opções de editar/remover via API.
 * 3. **Cadastrar Usuário**: Formulário para criar contas de usuário via API.
 * 4. **Histórico de Vendas**: Tabela com todas as compras registradas na plataforma.
 *
 * Todas as operações fazem requisições reais à API Spring Boot.
 * O token JWT é injetado automaticamente pelo interceptor.
 */
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JogoModel, JogoRequestModel, UserRequestModel, CompraModel, JogoBuscaExternaModel } from '../../../core/models/app.models';
import { JogoService } from '../../../shared/services/jogo-service';
import { UsuarioService } from '../../../shared/services/usuario-service';
import { CompraService } from '../../../shared/services/compra-service';
import { JogoExternoService } from '../../../shared/services/jogo-externo-service';
import { AuthService } from '../../../shared/services/auth-service';

/** Tipos possíveis das abas do painel admin */
export type AdminTab = 'cadastrar-jogo' | 'gerenciar-jogos' | 'cadastrar-usuario' | 'historico-vendas';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User implements OnInit {
  // ─────────────────────────────────────────────────────────
  // INJEÇÃO DE DEPENDÊNCIAS
  // ─────────────────────────────────────────────────────────
  private jogoService = inject(JogoService);
  private usuarioService = inject(UsuarioService);
  private compraService = inject(CompraService);
  private jogoExternoService = inject(JogoExternoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // ─────────────────────────────────────────────────────────
  // ESTADO GLOBAL DO PAINEL
  // ─────────────────────────────────────────────────────────

  /** Aba ativa no painel administrativo */
  abaAtiva = signal<AdminTab>('cadastrar-jogo');
  /** Controla visibilidade do menu em dispositivos móveis */
  menuMobileAberto = signal(false);
  /** Mensagem de feedback genérica (sucesso/info) */
  mensagemFeedback = signal('');
  /** Mensagem de erro genérica */
  mensagemErro = signal('');

  // ─────────────────────────────────────────────────────────
  // ESTADO: CADASTRAR JOGO
  // ─────────────────────────────────────────────────────────

  /** Nome do jogo a ser cadastrado */
  novoJogoNome = signal('');
  /** Preço do jogo a ser cadastrado */
  novoJogoPreco = signal('');
  /** Categoria/tipo do jogo a ser cadastrado */
  novoJogoTipo = signal('');
  /** Descrição do jogo a ser cadastrado */
  novoJogoDescricao = signal('');
  /** URL da imagem de capa (preenchida via IGDB ou manualmente) */
  novoJogoUrlImagem = signal('');
  /** Resultados da busca automática na IGDB */
  resultadosBuscaIgdb = signal<JogoBuscaExternaModel[]>([]);
  /** Indica se a busca IGDB está em andamento */
  buscandoIgdb = signal(false);
  /** Indica se o cadastro de jogo está em andamento */
  salvandoJogo = signal(false);

  // ─────────────────────────────────────────────────────────
  // ESTADO: GERENCIAR JOGOS
  // ─────────────────────────────────────────────────────────

  /** Lista de jogos carregados da API */
  jogos = signal<JogoModel[]>([]);
  /** Indica se os jogos estão sendo carregados */
  carregandoJogos = signal(false);
  /** Jogo selecionado para edição (modal) */
  jogoParaEditar = signal<JogoModel | null>(null);
  /** Jogo selecionado para remoção (modal de confirmação) */
  jogoParaRemover = signal<JogoModel | null>(null);
  /** Indica se a operação de salvar edição está em andamento */
  salvandoEdicao = signal(false);
  /** Indica se a operação de remoção está em andamento */
  removendoJogo = signal(false);

  // ─────────────────────────────────────────────────────────
  // ESTADO: CADASTRAR USUÁRIO
  // ─────────────────────────────────────────────────────────

  /** Nome do novo usuário */
  novoUsuarioNome = signal('');
  /** Email do novo usuário */
  novoUsuarioEmail = signal('');
  /** Senha do novo usuário */
  novoUsuarioSenha = signal('');
  /** Saldo inicial do novo usuário */
  novoUsuarioSaldo = signal('');
  /** Indica se o cadastro de usuário está em andamento */
  salvandoUsuario = signal(false);

  // ─────────────────────────────────────────────────────────
  // ESTADO: HISTÓRICO DE VENDAS
  // ─────────────────────────────────────────────────────────

  /** Lista de compras carregadas da API */
  compras = signal<CompraModel[]>([]);
  /** Indica se as compras estão sendo carregadas */
  carregandoCompras = signal(false);

  // ─────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────

  /**
   * Carrega os dados iniciais ao abrir o painel.
   * Busca a lista de jogos e o histórico de compras da API.
   */
  ngOnInit(): void {
    this.carregarJogos();
    this.carregarCompras();
  }

  // ─────────────────────────────────────────────────────────
  // NAVEGAÇÃO
  // ─────────────────────────────────────────────────────────

  /**
   * Troca a aba ativa do painel e fecha o menu mobile.
   * @param aba - Identificador da aba destino.
   */
  mudarAba(aba: AdminTab): void {
    this.abaAtiva.set(aba);
    this.menuMobileAberto.set(false);
    this.limparMensagens();
  }

  // ─────────────────────────────────────────────────────────
  // CADASTRAR JOGO
  // ─────────────────────────────────────────────────────────

  /**
   * Busca capas de jogos na API externa IGDB pelo nome informado.
   * Chamado quando o admin deseja buscar a capa automaticamente.
   *
   * Regra de negócio: O nome deve ter pelo menos 2 caracteres para evitar
   * buscas muito genéricas na API externa.
   */
  buscarCapaIgdb(): void {
    const nome = this.novoJogoNome().trim();
    if (nome.length < 2) {
      this.mensagemErro.set('Digite pelo menos 2 caracteres para buscar.');
      return;
    }

    this.buscandoIgdb.set(true);
    this.resultadosBuscaIgdb.set([]);

    this.jogoExternoService.buscarPorNome(nome).subscribe({
      next: (resultados) => {
        this.buscandoIgdb.set(false);
        this.resultadosBuscaIgdb.set(resultados);
        if (resultados.length === 0) {
          this.mensagemErro.set('Nenhum jogo encontrado na IGDB.');
        }
      },
      error: () => {
        this.buscandoIgdb.set(false);
        this.mensagemErro.set('Erro ao buscar na IGDB. Tente novamente.');
      }
    });
  }

  /**
   * Seleciona uma capa da lista de resultados da IGDB.
   * Preenche automaticamente o nome e a URL da imagem.
   *
   * @param resultado - Item selecionado da busca IGDB.
   */
  selecionarCapaIgdb(resultado: JogoBuscaExternaModel): void {
    this.novoJogoUrlImagem.set(resultado.urlImagem);
    this.novoJogoNome.set(resultado.nome);
    this.resultadosBuscaIgdb.set([]);
  }

  /**
   * Cadastra um novo jogo no catálogo via API.
   *
   * Regra de negócio:
   * - Nome, tipo e descrição são obrigatórios
   * - Preço deve ser >= 0
   * - A URL da imagem é opcional (pode vir da IGDB ou ser deixada em branco)
   */
  cadastrarJogo(): void {
    const nome = this.novoJogoNome().trim();
    const tipo = this.novoJogoTipo().trim();
    const descricao = this.novoJogoDescricao().trim();
    const preco = parseFloat(this.novoJogoPreco());
    const urlImagem = this.novoJogoUrlImagem().trim();

    if (!nome || !tipo || !descricao) {
      this.mensagemErro.set('Preencha nome, categoria e descrição.');
      return;
    }

    if (isNaN(preco) || preco < 0) {
      this.mensagemErro.set('Informe um preço válido.');
      return;
    }

    this.limparMensagens();
    this.salvandoJogo.set(true);

    const novoJogo: JogoRequestModel = {
      nome,
      tipo,
      descricao,
      preco,
      urlImagem: urlImagem || undefined
    };

    this.jogoService.salvarJogo(novoJogo).subscribe({
      next: (jogoSalvo) => {
        this.salvandoJogo.set(false);
        this.mensagemFeedback.set(`Jogo "${jogoSalvo.nome}" cadastrado com sucesso!`);
        // Adiciona o jogo salvo à lista local sem precisar recarregar tudo
        this.jogos.update(lista => [...lista, jogoSalvo]);
        // Limpa o formulário
        this.novoJogoNome.set('');
        this.novoJogoPreco.set('');
        this.novoJogoTipo.set('');
        this.novoJogoDescricao.set('');
        this.novoJogoUrlImagem.set('');
      },
      error: (err) => {
        this.salvandoJogo.set(false);
        this.mensagemErro.set(err.error?.message || 'Erro ao cadastrar jogo.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // GERENCIAR JOGOS
  // ─────────────────────────────────────────────────────────

  /**
   * Carrega a lista completa de jogos da API.
   */
  carregarJogos(): void {
    this.carregandoJogos.set(true);
    this.jogoService.buscarJogos().subscribe({
      next: (jogos) => {
        this.jogos.set(jogos);
        this.carregandoJogos.set(false);
      },
      error: () => {
        this.carregandoJogos.set(false);
        this.mensagemErro.set('Erro ao carregar jogos.');
      }
    });
  }

  /**
   * Abre o modal de confirmação para remoção de um jogo.
   * @param jogo - Jogo selecionado para remoção.
   */
  abrirModalRemover(jogo: JogoModel): void {
    this.jogoParaRemover.set(jogo);
  }

  /**
   * Confirma e executa a remoção de um jogo via API.
   *
   * Regra de negócio: Remove o jogo permanentemente do catálogo.
   * Após sucesso na API, remove também da lista local.
   */
  confirmarRemocao(): void {
    const jogo = this.jogoParaRemover();
    if (!jogo) return;

    this.removendoJogo.set(true);

    this.jogoService.deletarJogo(jogo.id).subscribe({
      next: () => {
        this.removendoJogo.set(false);
        // Remove da lista local após confirmação da API
        this.jogos.update(lista => lista.filter(j => j.id !== jogo.id));
        this.mensagemFeedback.set(`Jogo "${jogo.nome}" removido com sucesso!`);
        this.jogoParaRemover.set(null);
      },
      error: () => {
        this.removendoJogo.set(false);
        this.mensagemErro.set('Erro ao remover jogo.');
        this.jogoParaRemover.set(null);
      }
    });
  }

  /**
   * Abre o modal de edição com os dados atuais do jogo.
   * Cria uma cópia do objeto para não alterar o original antes de salvar.
   * @param jogo - Jogo selecionado para edição.
   */
  abrirModalEditar(jogo: JogoModel): void {
    this.jogoParaEditar.set({ ...jogo });
  }

  /**
   * Salva as alterações de um jogo via API.
   *
   * @param nome - Novo nome do jogo.
   * @param preco - Novo preço do jogo.
   * @param tipo - Nova categoria/tipo do jogo.
   * @param descricao - Nova descrição do jogo.
   */
  salvarEdicao(nome: string, preco: string, tipo: string, descricao: string): void {
    const jogoAtual = this.jogoParaEditar();
    if (!jogoAtual) return;

    this.salvandoEdicao.set(true);

    const jogoAtualizado: JogoRequestModel = {
      nome: nome.trim() || jogoAtual.nome,
      preco: parseFloat(preco) || jogoAtual.preco,
      tipo: tipo.trim() || jogoAtual.tipo,
      descricao: descricao.trim() || jogoAtual.descricao,
      urlImagem: jogoAtual.urlImagem
    };

    this.jogoService.atualizarJogo(jogoAtual.id, jogoAtualizado).subscribe({
      next: (jogoResponse) => {
        this.salvandoEdicao.set(false);
        // Atualiza na lista local com os dados retornados pela API
        this.jogos.update(lista =>
          lista.map(j => j.id === jogoAtual.id ? jogoResponse : j)
        );
        this.mensagemFeedback.set('Informações do jogo atualizadas!');
        this.jogoParaEditar.set(null);
      },
      error: () => {
        this.salvandoEdicao.set(false);
        this.mensagemErro.set('Erro ao atualizar jogo.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // CADASTRAR USUÁRIO
  // ─────────────────────────────────────────────────────────

  /**
   * Cadastra um novo usuário no sistema via API.
   *
   * Regra de negócio:
   * - Nome, email e senha são obrigatórios
   * - Senha mínima de 6 caracteres
   * - Email deve ser único (validado pelo backend)
   * - O campo isAdmin é sempre false no registro (controlado pelo backend)
   */
  cadastrarUsuario(): void {
    const nome = this.novoUsuarioNome().trim();
    const email = this.novoUsuarioEmail().trim();
    const senha = this.novoUsuarioSenha().trim();
    const saldo = parseFloat(this.novoUsuarioSaldo()) || 0;

    if (!nome || !email || !senha) {
      this.mensagemErro.set('Preencha nome, email e senha.');
      return;
    }

    if (senha.length < 6) {
      this.mensagemErro.set('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.limparMensagens();
    this.salvandoUsuario.set(true);

    const novoUsuario: UserRequestModel = { nome, email, senha, saldo };

    this.usuarioService.criarUsuario(novoUsuario).subscribe({
      next: (usuario) => {
        this.salvandoUsuario.set(false);
        this.mensagemFeedback.set(`Usuário "${usuario.nome}" cadastrado com sucesso!`);
        // Limpa o formulário
        this.novoUsuarioNome.set('');
        this.novoUsuarioEmail.set('');
        this.novoUsuarioSenha.set('');
        this.novoUsuarioSaldo.set('');
      },
      error: (err) => {
        this.salvandoUsuario.set(false);
        this.mensagemErro.set(err.error?.message || err.error || 'Erro ao cadastrar usuário.');
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // HISTÓRICO DE VENDAS
  // ─────────────────────────────────────────────────────────

  /**
   * Carrega o histórico completo de compras da API.
   * Rota: GET /api/v1/compras (requer role ADMIN).
   */
  carregarCompras(): void {
    this.carregandoCompras.set(true);
    this.compraService.listarCompras().subscribe({
      next: (compras) => {
        this.compras.set(compras);
        this.carregandoCompras.set(false);
      },
      error: () => {
        this.carregandoCompras.set(false);
      }
    });
  }

  // ─────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────

  /**
   * Encerra a sessão e redireciona para o login.
   * Usa o AuthService para limpar token e dados do localStorage.
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
