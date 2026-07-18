export interface User {
  id: string;
  nome: string;
  senha?: string; // Opcional no front por segurança
  saldo: number;
  jogos: Array<Jogo>;
  role: 'admin' | 'client';
}

export interface Jogo {
  id: string;
  nome: string;
  preco: number;
  categoria: TipoJogo;
  capaUrl: string; // Guardará o base64 ou URL fictícia da imagem
}

export interface Compra {
  id: string;
  user: User;
  jogo: Jogo;
  precoPago: number;
  data: Date;
}

export enum TipoJogo {
  ACAO, AVENTURA, RPG, ESPORTE, INDIE, ESTRATEGIA
}