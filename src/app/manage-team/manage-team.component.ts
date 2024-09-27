import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Player } from '../models/player';
import { Team } from '../models/team';
import { LoaderService } from '../services/loader.service';
import { RosterService } from '../services/roster.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-manage-team',
  templateUrl: './manage-team.component.html',
  styleUrls: ['./manage-team.component.scss']
})
export class ManageTeamComponent {
  currentTeam: Team = new Team()
  currentTeamSubscription: Subscription = this.teamService.currentTeam$.subscribe(
    res => this.currentTeam = res
  )
  currentRoster: Player[] = [];
  currentRosterSubscription: Subscription = this.rosterService.currentRoster$.subscribe(
    res => this.currentRoster = res
  )
  currentPlayer: Player = new Player();
  editMode: boolean = false;
  constructor(private teamService: TeamsService, private rosterService: RosterService, private loaderService: LoaderService) {

  }
  onPlayerSelected(id: number) {
    this.currentPlayer = this.rosterService.getPlayerById(id) || new Player();
    this.editMode = true;

  }
  onPlayerSaved(e: boolean) {
    if (e) {
      this.editMode = false;
      this.currentPlayer = new Player();
    }
  }
}
