export interface User {
  id: string;
  nome: string;
  senha?: string; // Opcional no front por segurança
  saldo: number;
  jogos: Array<Jogo>;
  role: boolean;
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

export interface UserModel {
  id: number;
  nome: string;
  email: string;
  saldo: number;
  senha?: string; // Opcional no front por segurança
  admin: boolean;
}

export interface JogoModel {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  urlImagem: string; // Guardará o base64 ou URL fictícia da imagem
  descricao: string;
}

export interface CompraModel {
  id: number;
  user: Partial<User>;
  jogo: Partial<Jogo>;
  valorPago: number;
  dataCompra: Date | string;
}

export enum TipoJogo {
  ACAO, AVENTURA, RPG, ESPORTE, INDIE, ESTRATEGIA
}