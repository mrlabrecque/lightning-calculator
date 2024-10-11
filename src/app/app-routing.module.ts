import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BattingLineupComponent } from './batting-lineup/batting-lineup.component';
import { LineupComponent } from './lineup/lineup.component';
import { LoginComponent } from './login/login.component';
import { ManageTeamPlayerComponent } from './manage-team-player/manage-team-player.component';
import { ManageTeamComponent } from './manage-team/manage-team.component';
import { ProfileComponent } from './profile/profile.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { TrendsComponent } from './trends/trends.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, //default route
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'profile', title: 'Profile', component: ProfileComponent },
  { path: 'stats', title: 'Stats', component: TrendsComponent },
  {
    path: 'manage-team',
    title: 'Manage Team',
    component: ManageTeamComponent,
    children: [{ path: 'player', component: ManageTeamPlayerComponent }],
  },
  {
    path: 'defensive-lineup',
    title: 'Defensive Lineup',
    component: LineupComponent,
  },
  {
    path: 'batting-lineup',
    title: 'Batting Lineup',
    component: BattingLineupComponent,
  },
  { path: '**', component: TrendsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
