import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { Player } from '../models/player';
import { Team } from '../models/team';
import { LoaderService } from '../services/loader.service';
import { RosterService } from '../services/roster.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-manage-team',
  templateUrl: './manage-team.component.html',
  styleUrls: ['./manage-team.component.scss'],
})
export class ManageTeamComponent {
  get avatarUrl() {
    return this.teamForm.value.teamImageUrl as string;
  }
  currentTeam: Team = new Team();
  currentTeamSubscription: Subscription = this.teamService.currentTeam$
    .pipe(filter((val) => !!val.id))
    .subscribe((res) => (this.currentTeam = res));
  currentRoster: Player[] = [];
  currentRosterSubscription: Subscription =
    this.rosterService.currentRoster$.subscribe(
      (res) => (this.currentRoster = res)
    );
  currentPlayer: Player = new Player();
  editMode: boolean = false;
  teamForm = this.formBuilder.group({
    teamName: [this.currentTeam.name],
    teamImageUrl: [this.currentTeam.imageUrl],
    teamJoinCode: [this.currentTeam.join_code],
  });
  constructor(
    private teamService: TeamsService,
    private rosterService: RosterService,
    private loaderService: LoaderService,
    private formBuilder: FormBuilder
  ) {}
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
  updateTeamLogo(event: any) {
    this.teamForm.patchValue({
      teamImageUrl: event,
    });
    this.onSubmit();
  }
  onSubmit() {
    const teamName = this.teamForm.value.teamName as string;
    const teamImageUrl = this.teamForm.value.teamImageUrl as string;
    const profile = {
      id: this.currentTeam.id,
      name: teamName,
      imageUrl: teamImageUrl,
    };
    this.teamService.updateTeamProfile(profile);
  }
  onCancelClicked() {}
}
