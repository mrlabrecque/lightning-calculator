import { Component, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Team } from '../models/team';
import { GamesService } from '../services/games.service';
import { LoaderService } from '../services/loader.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-team-selector',
  templateUrl: './team-selector.component.html',
  styleUrls: ['./team-selector.component.scss'],
})
export class TeamSelectorComponent {
  public selectedTeam: any = {};
  @Output() public selectedTeamEmitter: EventEmitter<number> =
    new EventEmitter();
  public teams: Team[] = [];
  public allTeamsSubscription: Subscription =
    this.teamService.allTeams$.subscribe((res) => (this.teams = [...res]));

  constructor(
    private teamService: TeamsService,
    private gameService: GamesService,
    private loaderService: LoaderService
  ) {}
  async onTeamSelectChange() {
    this.loaderService.pageLoading$.next(true);
    this.selectedTeamEmitter.emit(this.selectedTeam.id);
  }
}
