import { Routes } from '@angular/router';
import {Home} from './features/home/home';
import { Login } from './features/auth/login/login';
import { Cadastro } from './features/auth/cadastro/cadastro';
import { User } from './features/users/user/user';
import { Client } from './features/users/client/client';


export const routes: Routes = [
    {path: '', component: Home},
    {path: 'login', component : Login},
    {path: 'login/cadastro', component : Cadastro},
    {path: 'cadastro', component : Cadastro},
    {path: 'admin', component : User},
    {path: 'cliente', component : Client},
    {path: '**', redirectTo : ''}
];
