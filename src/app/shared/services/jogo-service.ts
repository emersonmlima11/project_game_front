import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Jogo, JogoModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class JogoService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/v1/jogos';
    private token = localStorage.getItem("token")

   
        

    buscarJogos(): Observable<JogoModel[]> {
         const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
    });
        return this.http.get<JogoModel[]>(this.apiUrl, {headers});
    }
    
    
    salvarJogo(usuario: JogoModel): Observable<JogoModel> {
        return this.http.post<JogoModel>(this.apiUrl, usuario);
    }
    
    atualizarUsuario(id: number, jogo: JogoModel): Observable<JogoModel>{
        return this.http.put<JogoModel>(`${this.apiUrl}/${id}`, jogo);
    }
    
    deletarJogo(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
    
}
