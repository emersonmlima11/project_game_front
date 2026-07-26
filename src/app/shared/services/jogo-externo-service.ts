import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';

@Injectable({providedIn: 'root'})
export class JogoExternoService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/v1/jogos/externo';

}
