import { Injectable, Service } from '@angular/core';

@Service()
export class VisualizacaoSenha {
    toogleInputType(type:string):string{
        return type === 'password' ? 'text' : 'password';
    }
}
