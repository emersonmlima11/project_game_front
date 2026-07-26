import { inject, Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JogoModel, UserModel } from '../../core/models/app.models';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/v1/usuarios';

    buscarUsuarios(): Observable<UserModel[]> {
        return this.http.get<UserModel[]>(this.apiUrl);
    }

    buscarUsuarioId(id : number): Observable<UserModel>{
        return this.http.get<UserModel>(`${this.apiUrl}/${id}`);
    }

    criarUsuario(usuario: UserModel): Observable<UserModel> {
        return this.http.post<UserModel>(this.apiUrl, usuario);
    }

    atualizarUsuario(id: number, usuario: UserModel): Observable<UserModel>{
        return this.http.put<UserModel>(`${this.apiUrl}/${id}`, usuario);
    }

    deletarUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    listarJogosDoUsuario(id: number): Observable<JogoModel[]>{
        return this.http.get<JogoModel[]>(`${this.apiUrl}/${id}/jogos`);
    }

}
