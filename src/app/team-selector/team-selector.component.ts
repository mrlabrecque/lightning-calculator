import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Team } from '../models/team';
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
    private teamService: TeamsService) {
  }
  async onTeamSelectChange() {
    this.teamService.setCurrentTeam(this.selectedTeam.id);
  }
}
