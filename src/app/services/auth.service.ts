import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { environment } from 'src/environment';
import { SupabaseService } from './supabase.service';
import { TeamsService } from './teams.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public loggedUser$: BehaviorSubject<any> = new BehaviorSubject(null);
  public loggedSession$: BehaviorSubject<any> = new BehaviorSubject(null);
  public loggedSessionSubscription: Subscription = this.loggedSession$
    .pipe(filter((value) => !!value))
    .subscribe((res) => this.onSessionSuccess(res));
  constructor(
    private supabaseService: SupabaseService,
    private teamService: TeamsService,
    private routerService: Router
  ) {}
  async signIn(dataFromInput: any) {
    await this.supabaseService.supabase.auth
      .signInWithPassword({
        email: dataFromInput.email,
        password: dataFromInput.password,
      })
      .then((res) => this.onUserLoggedInSuccessfully(res.data))
      .catch((error) => console.log(error));
  }
  async signUpNewUser(dataFromInput: any) {
    await this.supabaseService.supabase.auth
      .signUp({
        email: dataFromInput.email,
        password: dataFromInput.password,
        options: {
          data: {
            associatedTeamId: dataFromInput.teamId,
          },
        },
      })
      .then((res) => this.onUserLoggedInSuccessfully(res.data))
      .catch((error) => console.log(error));
  }
  onUserLoggedInSuccessfully(data: any) {
    this.loggedUser$.next(data.user);
    this.loggedSession$.next(data.session);
  }
  public onSessionSuccess(userSession: any) {
    this.supabaseService.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        global: {
          headers: { Authorization: `Bearer ${userSession.access_token}` },
        },
      }
    );
    const teamId = userSession.user.user_metadata.associatedTeamId;
    if (teamId > 0) {
      this.teamService
        .setCurrentTeam(teamId)
        .then(() => this.routerService.navigate(['stats']));
    }
  }
  public async getAuthenticatedUserOnAppReload() {
    const { data } = await this.supabaseService.supabase.auth.getSession();
    if (data) {
      this.loggedSession$.next(data.session);
      this.loggedUser$.next(data.session?.user);
    } else {
      this.routerService.navigate(['login']);
    }
  }
  public async onLogout() {
    await this.supabaseService.supabase.auth.signOut().then(() => {
      this.routerService.navigate(['logout']);
      this.loggedSession$.next(null);
      this.loggedUser$.next(null);
    });
  }
}
