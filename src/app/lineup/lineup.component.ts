import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Game } from '../models/game';
import { Inning } from '../models/inning';
import { GamesService } from '../services/games.service';
import { InningService } from '../services/inning.service';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss']
})
export class LineupComponent {
  currentGameSubscription: Subscription = this.gameService.currentGame$
  .subscribe(res => this.currentGame = res)
  currentGame: Game | undefined; 
    currentInningSubscription: Subscription = this.inningService.currentInning$
  .subscribe(res => this.currentInning = res)
  currentInning: Inning | undefined; 
  constructor(private gameService: GamesService, private inningService: InningService) {
  }
  async createNewGame() {
    this.gameService.createNewGame(1);
  }
}
