import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Game } from '../models/game';
import { Team } from '../models/team';
import { GamesService } from '../services/games.service';
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

    constructor(
    private teamService: TeamsService, private gameService: GamesService) {
  }
  async onTeamSelectChange() {
    let gameInSession;
    this.gameService.getAnyActiveGameFromTeam(this.selectedTeam.id).then(res => this.checkForActiveGameComplete(res));
  
  }
  checkForActiveGameComplete(res: any) {
    this.gameService.gameInSession$.next(new Game());
    if (res.length > 0) {
      this.gameService.gameInSession$.next(res[res.length - 1]);
      window.localStorage.setItem("GameInSession", JSON.stringify(res[res.length - 1]));
    }
    this.teamService.setCurrentTeam(this.selectedTeam.id);
  }
}
