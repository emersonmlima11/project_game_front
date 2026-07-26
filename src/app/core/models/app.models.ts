/**
 * @fileoverview Modelos de dados do frontend alinhados com os DTOs da API Spring Boot.
 *
 * Cada interface espelha exatamente a estrutura JSON retornada/enviada pela API,
 * garantindo tipagem segura nas chamadas HTTP.
 */

// ─────────────────────────────────────────────────────────
// USUÁRIO
// ─────────────────────────────────────────────────────────

/**
 * Representa os dados do usuário retornados pela API.
 * Espelha o {@code UserResponseDTO} do backend.
 *
 * @remarks Não contém senha — o backend nunca a expõe nas respostas.
 */
export interface UserModel {
  /** Identificador único do usuário no banco de dados */
  idUser: number;
  /** Nome completo do usuário */
  nome: string;
  /** Saldo da carteira digital do usuário (em R$) */
  saldo: number;
  /** Indica se o usuário possui permissões de administrador */
  admin: boolean;
}

/**
 * Dados enviados ao backend para criar ou atualizar um usuário.
 * Espelha o {@code UserRequestDTO} do backend.
 */
export interface UserRequestModel {
  /** Nome completo (2 a 50 caracteres) */
  nome: string;
  /** Email válido e único no sistema */
  email: string;
  /** Senha de acesso (mínimo 6 caracteres) */
  senha: string;
  /** Saldo inicial da carteira (>= 0) */
  saldo: number;
}

// ─────────────────────────────────────────────────────────
// JOGO
// ─────────────────────────────────────────────────────────

/**
 * Representa os dados de um jogo retornados pela API.
 * Espelha o {@code JogoResponseDTO} do backend.
 */
export interface JogoModel {
  /** Identificador único do jogo */
  id: number;
  /** Nome/título do jogo */
  nome: string;
  /** Preço de venda em R$ */
  preco: number;
  /** Categoria/gênero do jogo (ex: "Ação", "RPG") */
  tipo: string;
  /** URL da imagem de capa do jogo */
  urlImagem: string;
  /** Descrição detalhada do jogo */
  descricao: string;
}

/**
 * Dados enviados ao backend para criar ou atualizar um jogo.
 * Espelha o {@code JogoRequestDTO} do backend.
 */
export interface JogoRequestModel {
  /** Nome do jogo (1 a 100 caracteres, obrigatório) */
  nome: string;
  /** Categoria/gênero do jogo (obrigatório) */
  tipo: string;
  /** URL da imagem de capa (opcional — pode ser preenchida via IGDB) */
  urlImagem?: string;
  /** Preço de venda em R$ (>= 0) */
  preco: number;
  /** Descrição do jogo (obrigatório) */
  descricao: string;
}

// ─────────────────────────────────────────────────────────
// COMPRA
// ─────────────────────────────────────────────────────────

/**
 * Representa o recibo de uma compra retornado pela API.
 * Espelha o {@code CompraResponseDTO} do backend.
 */
export interface CompraModel {
  /** Identificador da transação de compra */
  idCompra: number;
  /** Nome do usuário que realizou a compra */
  nomeUsuario: string;
  /** Nome do jogo adquirido */
  nomeJogo: string;
  /** Data e hora em que a compra foi registrada (formato ISO 8601) */
  dataCompra: string;
  /** Valor pago na transação (em R$) */
  preco: number;
}

/**
 * Dados enviados ao backend para registrar uma nova compra.
 * Espelha o {@code CompraRequestDTO} do backend.
 */
export interface CompraRequestModel {
  /** ID do usuário comprador */
  userId: number;
  /** ID do jogo a ser adquirido */
  jogoId: number;
}

// ─────────────────────────────────────────────────────────
// BUSCA EXTERNA (IGDB)
// ─────────────────────────────────────────────────────────

/**
 * Resultado simplificado de uma busca de jogo na API externa (IGDB).
 * Espelha o {@code JogoBuscaExternaDTO} do backend.
 */
export interface JogoBuscaExternaModel {
  /** Nome do jogo encontrado na IGDB */
  nome: string;
  /** URL da capa do jogo em alta resolução */
  urlImagem: string;
}