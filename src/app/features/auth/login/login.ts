import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  isLoginMode = true

  constructor(private router: Router){

  }

  executarLogin(): void{
    this.router.navigate(['/admin']);
  }
}
