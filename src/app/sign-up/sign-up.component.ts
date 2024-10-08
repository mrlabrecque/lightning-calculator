import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent {
  public email: string = '';
  public password: string = '';
  public teamId: number = 1;
  constructor(private authService: AuthService) {}
  onSignUpClicked() {
    const newUserObject = {
      email: this.email,
      password: this.password,
      teamId: this.teamId,
    };
    this.authService.signUpNewUser(newUserObject);
  }
  selectedTeamChanged(selectedTeamId: number) {
    this.teamId = selectedTeamId;
  }
}
