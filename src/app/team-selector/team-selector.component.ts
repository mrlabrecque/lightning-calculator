import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Game } from '../models/game';
import { Team } from '../models/team';
import { GamesService } from '../services/games.service';
import { LoaderService } from '../services/loader.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-team-selector',
  templateUrl: './team-selector.component.html',
  styleUrls: ['./team-selector.component.scss']
})
export class TeamSelectorComponent {
  public selectedTeam: any = {};
  public teams: Team[] = [];
  public allTeamsSubscription: Subscription = this.teamService.allTeams$.subscribe(res => this.teams = [...res])
  public currentTeamSubscription: Subscription = this.teamService.currentTeam$.subscribe(res => this.selectedTeam = res)

    constructor(
    private teamService: TeamsService, private gameService: GamesService, private loaderService: LoaderService) {
  }
  async onTeamSelectChange() {
    this.loaderService.pageLoading$.next(true);
    this.gameService.getAnyActiveGameFromTeam(this.selectedTeam.id).then(res => this.checkForActiveGameComplete(res));
  
  }
  async checkForActiveGameComplete(res: any) {
    this.gameService.gameInSession$.next(new Game());
    if (res.length > 0) {
      this.gameService.gameInSession$.next(res[res.length - 1]);
      window.localStorage.setItem("GameInSession", JSON.stringify(res[res.length - 1]));
    }
    await this.teamService.setCurrentTeam(this.selectedTeam.id);
  }
}
