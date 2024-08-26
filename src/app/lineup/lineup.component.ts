import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { Game } from '../models/game';
import { Inning } from '../models/inning';
import { InningPlayer } from '../models/inning-player';
import { Player } from '../models/player';
import { POSITIONS } from '../models/positions.';
import { GamesService } from '../services/games.service';
import { InningService } from '../services/inning.service';
import { RosterService } from '../services/roster.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss']
})
export class LineupComponent {
  public positions: any[] = POSITIONS;
  currentGameSubscription: Subscription = this.gameService.currentGame$
  .pipe(filter((value) => value?.id !== undefined))
  .subscribe(res => this.currentGame = res)
  currentGame: Game = new Game(); 
  currentInningSubscription: Subscription = this.inningService.currentInning$
    .pipe(filter((value) => value?.id !== undefined))
    .subscribe(res => this.onCurrentInningChanged(res))
  currentInning: Inning = new Inning(); 

  currentInningPlayers$: BehaviorSubject<InningPlayer[]> = new BehaviorSubject([new InningPlayer()]);
  currentInningPlayers: InningPlayer[] = [];
  currentGameRoster: Player[] = [];

  splitButtonList = [
    {
      label: 'Complete Game',
      command: () => {
        this.completeGame();
      }
    }];
  sortedInningPlayersByMaxBenched: any;
  constructor(private messageService: MessageService,private gameService: GamesService, private inningService: InningService, private rosterService: RosterService, private teamService: TeamsService) {
  }
  async createNewGame() {
    await this.gameService.createNewGame(this.teamService.getCurrentTeamId());
    this.currentGameRoster = this.rosterService.getAllTeamPlayers();
    this.addAnyBenchPositionsNeeded();
  }
  onCurrentInningChanged(inning: Inning) {
    this.currentInning = inning;
    this.createInningPlayers();
  }
  async createInningPlayers() {
    const currentPlayers = [...this.currentGameRoster];
    const numberOfBenchedInGame = await this.inningService.getBenchNumberPlayer(this.currentGame.id ?? 1, currentPlayers)
    let tempInningPlayers: InningPlayer[] = [];
    if (this.currentInning.inningNumber === 1) {
      if (currentPlayers.length > 0) {
        currentPlayers.forEach(player => {
          const newInningPlayerObject: InningPlayer = {
            inning: this.currentInning,
            playerName: player.Name,
            playerId: player.id,
            position: '',
            timesBenched: this.findBenchedRecords(player?.id,numberOfBenchedInGame)
        };
          tempInningPlayers.push(newInningPlayerObject);
        })
      }
    } else {
      tempInningPlayers = [...this.currentInningPlayers];
      tempInningPlayers.forEach(player => {
        player.timesBenched = this.findBenchedRecords(player.playerId,numberOfBenchedInGame)
      })
    }
    this.currentInningPlayers = [...tempInningPlayers];
    this.updateMostBenchedPlayers();
  }
  private addAnyBenchPositionsNeeded() {
    if (this.currentGameRoster.length > 10) {
      let numberOfBenchToAdd = this.currentGameRoster.length - 10;
      while (numberOfBenchToAdd > 0
        && this.currentGameRoster.length != this.positions.length
      ) {
        this.positions.push({
          "label": "B",
          "value": "B",
        });
        numberOfBenchToAdd--;
      }
    }
  }
  updateMostBenchedPlayers() {
    const copiedInningPlayers = [...this.currentInningPlayers];
    copiedInningPlayers.sort((a, b) => {
     return (b.timesBenched) - (a.timesBenched)
    })
    this.sortedInningPlayersByMaxBenched = [...copiedInningPlayers].filter(player => player.timesBenched > 0);
  }

  submitInning() {
    if (this.currentInning) {
      this.currentInning.submitted = true;
    }
    this.setPositionsOnPlayers();
    this.inningService.insertInningPlayers(this.currentInningPlayers, this.positions);
    this.messageService.add({ severity: 'success', summary: 'Inning Saved', detail: 'Start next inning or complete game' })

  }
  setPositionsOnPlayers() {
    this.currentInningPlayers.forEach((inningPlayer: InningPlayer, i) => {
      inningPlayer.position = this.positions[i].value;
    })
  }
  onNextInningClicked(){
    this.inningService.insertNewActiveInning(this.currentGame);
  }
  findBenchedRecords(playerId: number = 0, benchedRecords: any) {
    const benchedTimes = benchedRecords?.filter((rec:any) => rec.playerId === playerId)
    return benchedTimes?.length ?? 0
  }
  completeGame() {
    console.log("complete game");
  }
}
