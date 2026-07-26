import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  //constructor(@Inject(PLATFORM_ID) private platformId: Object){}
 /*ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      // Este log aparecerá apenas no terminal do seu servidor Node.js
      console.log('Executando no Servidor (SSR Ativo)!');
    }

    if (isPlatformBrowser(this.platformId)) {
      // Este log aparecerá apenas no console do navegador do usuário
      console.log('Executando no Navegador (Cliente)!');
    }
  }*/
}
