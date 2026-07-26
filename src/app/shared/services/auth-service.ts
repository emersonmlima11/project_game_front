import { Injectable, Service, inject, signal } from '@angular/core';
import { UserModel } from '../../core/models/app.models';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginResponse{
    token: string;
    usuario: UserModel;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = 'http://localhost:8080/api/v1/auth'; // Ajuste a URL do seu controller de auth

    // Signal com o usuário ativo na aplicação
    // usuarioAtual = signal<UserModel | null>(this.obterUsuarioDoStorage());

    // REALIZAR LOGIN
    login(credenciais: { email: string; senha?: string }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciais).pipe(
        tap((res) => {
            //   console.log(res)
            // Salva Token e Usuário no localStorage
            localStorage.setItem('token', res.token);
            // localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
          
            // Atualiza o Signal global
            // this.usuarioAtual.set(res.usuario);
        })
        );
    }

    // CADASTRAR NOVO USUÁRIO
    //cadastrar(usuario: UserModel): Observable<UserModel> {
    //    return this.http.post<UserModel>(`${this.apiUrl}/cadastrar`, usuario);
    //}

    // LOGOUT (Sair da conta)
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario_logado');
        // this.usuarioAtual.set(null);
        this.router.navigate(['/login']);
    }

    // Recupera dados salvos no navegador ao recarregar a página
    // private obterUsuarioDoStorage(): UserModel | null {
    //     const userJson = localStorage.getItem('usuario_logado');
    //     return userJson ? JSON.parse(userJson) : null;
    // }
}
