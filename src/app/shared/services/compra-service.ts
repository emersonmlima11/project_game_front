import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Compra, CompraModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class CompraService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/v1/compras';

        listarCompras(): Observable<CompraModel[]> {
            return this.http.get<CompraModel[]>(this.apiUrl);
        }
    
    
        realizarCompra(compra: CompraModel): Observable<CompraModel> {
            return this.http.post<CompraModel>(this.apiUrl, compra);
        }
    
    
        listarComprasDoUsuario(id: number): Observable<CompraModel[]>{
            return this.http.get<CompraModel[]>(`${this.apiUrl}/usuario/${id}`);
        }
}
