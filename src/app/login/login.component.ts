import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public email: string = '';
  public password: string = '';
  public teamId: number = 1;
  constructor(private authService: AuthService) {}
  onSignInClicked() {
    const newUserObject = {
      email: this.email,
      password: this.password,
    };
    this.authService.signIn(newUserObject);
  }
}
