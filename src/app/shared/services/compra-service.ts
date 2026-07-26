/**
 * @fileoverview Serviço responsável pelas operações de compra na loja.
 * Comunica-se com o endpoint /api/v1/compras da API Spring Boot.
 *
 * O token JWT é injetado automaticamente pelo {@link authInterceptor}.
 */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CompraModel, CompraRequestModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';

/**
 * Serviço singleton para operações de compra.
 * Permite listar histórico global, por usuário e registrar novas compras.
 *
 * @example
 * ```typescript
 * // Registrar uma compra
 * this.compraService.realizarCompra({ userId: 1, jogoId: 5 }).subscribe();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/compras';

  /**
   * Lista todas as compras registradas na loja (visão administrativa).
   * Rota protegida (ADMIN): GET /api/v1/compras
   *
   * @returns Observable com array de {@link CompraModel} contendo o histórico global.
   */
  listarCompras(): Observable<CompraModel[]> {
    return this.http.get<CompraModel[]>(this.apiUrl);
  }

  /**
   * Registra uma nova compra de jogo para um usuário.
   * Rota protegida (autenticado): POST /api/v1/compras
   *
   * @param compra - Objeto com {@link CompraRequestModel} contendo userId e jogoId.
   * @returns Observable com o {@link CompraModel} representando o recibo da compra.
   */
  realizarCompra(compra: CompraRequestModel): Observable<CompraModel> {
    return this.http.post<CompraModel>(this.apiUrl, compra);
  }

  /**
   * Lista o histórico de compras de um usuário específico.
   * Rota protegida (autenticado): GET /api/v1/compras/usuario/:userId
   *
   * @param userId - ID do usuário cujo histórico será listado.
   * @returns Observable com array de {@link CompraModel} do usuário.
   */
  listarComprasDoUsuario(userId: number): Observable<CompraModel[]> {
    return this.http.get<CompraModel[]>(`${this.apiUrl}/usuario/${userId}`);
  }
}
