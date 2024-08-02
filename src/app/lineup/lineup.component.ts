import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Game } from '../models/game';
import { Inning } from '../models/inning';
import { InningPlayer } from '../models/inning-player';
import { POSITIONS } from '../models/positions.';
import { GamesService } from '../services/games.service';
import { InningService } from '../services/inning.service';
import { RosterService } from '../services/roster.service';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss']
})
export class LineupComponent {
    public positions: any[] = POSITIONS;
  currentGameSubscription: Subscription = this.gameService.currentGame$
  .subscribe(res => this.currentGame = res)
  currentGame: Game | undefined; 
  currentInningSubscription: Subscription = this.inningService.currentInning$
    .subscribe(res => this.onCurrentInningChanged(res))
  currentInning: Inning | undefined; 

  currentInningPlayers$: BehaviorSubject<InningPlayer[]> = new BehaviorSubject([new InningPlayer()]);
  currentInningPlayers: InningPlayer[] = [];
  constructor(private gameService: GamesService, private inningService: InningService, private rosterService: RosterService) {
  }
  async createNewGame() {
    this.gameService.createNewGame(1);
  }
  onCurrentInningChanged(inning: Inning) {
    this.currentInning = inning;
    this.createInningPlayers();
  }
  createInningPlayers() {
    const currentPlayers = this.rosterService.getAllTeamPlayers();
    const tempInningPlayers: InningPlayer[] = [];
    if (currentPlayers.length > 0) {
          currentPlayers.forEach(player => {
      const newInningPlayerObject: InningPlayer = {
        inning: this.currentInning,
        playerName: player.Name,
        position: ''
      };
      tempInningPlayers.push(newInningPlayerObject);
    })
    }
    this.currentInningPlayers = [...tempInningPlayers];

  }
}
