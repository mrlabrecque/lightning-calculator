import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
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
  newPositionsSubscription: Subscription = this.inningService.positions$
     .pipe(filter((value) => value.length > 10))
    .subscribe(res => this.positions = [...res])
  newInningInsertedSubscription: Subscription = this.inningService.nextInningForViewerClicked$
     .pipe(filter((value) => value?.id > -1))
    .subscribe(res => this.newInningInserted(res))
  gameInSessionSubscription: Subscription = this.gameService.gameInSession$.subscribe(res => this.gameInSession = res.id > -1 ?  res : null);
  gameInSession: Game | null = null;
  currentGameSubscription: Subscription = this.gameService.currentGame$
    .pipe(filter(value => !!value.id))
    .subscribe(res => {
      this.currentGame = res
    })
  currentGame: Game = new Game(); 
  currentInningSubscription: Subscription = this.inningService.currentInning$
    .pipe(filter((value) => value.id > -1))
    .subscribe(res => this.onCurrentInningChanged(res))
  currentInning: Inning = new Inning(); 
    currentInningPlayersSubscription: Subscription = this.inningService.currentInningPlayers$
    .pipe(filter(value => value.length > 1 ))
      .subscribe(res => { this.onCurrentInningPlayersChanged(res)
    })
  currentInningPlayers: InningPlayer[] = [];
  currentGameRoster: Player[] = [];
  gameCreatorSubscription: Subscription = this.gameService.isGameCreator$
  .subscribe(res => this.isGameCreator = res)
  isGameCreator: boolean = false; 
  loading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
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
  ngOnInit() {
    this.checkIfGameInSessionAndAmITheCreator()
  }
  async createNewGame() {
    this.loading$.next(true);
    this.currentGameRoster = this.rosterService.getAllTeamPlayers();
    this.gameService.createNewGame(this.teamService.getCurrentTeamId())
  }
  onCurrentInningChanged(inning: Inning) {
    this.currentInning = inning;
  }
  async onCurrentInningPlayersChanged(inningPlayers: InningPlayer[]) {
   // this.gameService.addAnyNeededBenchPositions(inningPlayers);
    await this.handleBenchStuff(inningPlayers);
    let sortedArray: InningPlayer[] = [];
    let copiedInningPlayers: any[] = [...inningPlayers];
    this.positions.forEach(pos => {
      const found = copiedInningPlayers.find(ip => ip.position === pos.value&& !ip.found);
      if (found) {
        found.found = true;
        sortedArray.push(found);
      }
    })
    sortedArray.forEach((v: any) => delete v.found);
    this.currentInningPlayers = sortedArray.length === inningPlayers.length ? sortedArray : inningPlayers;
    this.loading$.next(false);
  }

  private async handleBenchStuff(inningPlayers: InningPlayer[]) {
    const numberOfBenchedInGame = await this.inningService.getBenchNumberPlayer(this.currentGame.id ?? 1, inningPlayers);
    inningPlayers.forEach(ip => ip.timesBenched = this.findBenchedRecords(ip.playerId, numberOfBenchedInGame));
    this.updateMostBenchedPlayers(inningPlayers);
  }

  // async createInningPlayers() {
  //   const currentPlayers = [...this.currentGameRoster];
  //   const numberOfBenchedInGame = await this.inningService.getBenchNumberPlayer(this.currentGame.id ?? 1, currentPlayers)
  //   let tempInningPlayers: InningPlayer[] = [];
  //   if (this.currentInning.inningNumber === 1 && !this.currentInning.submitted) {
  //     this.createTempInningPlayersForNewGame(currentPlayers, numberOfBenchedInGame, tempInningPlayers);
  //   } else {
  //     tempInningPlayers = [...this.currentInningPlayers];
  //     tempInningPlayers.forEach(player => {
  //       player.timesBenched = this.findBenchedRecords(player.playerId, numberOfBenchedInGame)
  //       player.inning = this.currentInning;
  //     })
  //   }
  //   this.currentInningPlayers = [...tempInningPlayers];
  //   this.updateMostBenchedPlayers();
  //   if (this.isGameCreator) {
  //        this.inningService.insertInningPlayers(this.currentInningPlayers, this.positions).then(
  //     () => this.loading$.next(false)
  //   );
  //   } else {
  //     this.loading$.next(false)
  //   }
 
  // }
  findBenchedRecords(playerId: number = 0, benchedRecords: any) {
    const benchedTimes = benchedRecords?.filter((rec:any) => rec.playerId === playerId)
    return benchedTimes?.length ?? 0
  }

  updateMostBenchedPlayers(inningPlayers: InningPlayer[]) {
    const copiedInningPlayers = [...inningPlayers];
    copiedInningPlayers.sort((a, b) => {
     return a.timesBenched && b.timesBenched ? (b.timesBenched) - (a.timesBenched) : 0
    })
    this.sortedInningPlayersByMaxBenched = [...copiedInningPlayers].filter(player => player.timesBenched ? player.timesBenched > 0 : 0);
  }

 async submitInning() {
    if (this.currentInning) {
      this.currentInning.submitted = true;
      await this.inningService.updateInningToSubmitted(this.currentInning);
    }
    this.setPositionsOnPlayers();
    this.inningService.updateInningPlayers(this.currentInningPlayers).then(
      () => this.messageService.add({ severity: 'success', summary: 'Inning Saved', detail: 'Start next inning or complete game' })
    );
  }
  setPositionsOnPlayers() {
    this.currentInningPlayers.forEach((inningPlayer: InningPlayer, i) => {
      inningPlayer.position = this.positions[i].value;
    })
  }
  onNextInningClicked(){
    this.inningService.createNewActiveInning(this.currentGame?.id, this.currentInningPlayers)
  }

  async completeGame() {
    this.loading$.next(true);
    this.removeLocalStorage();
    this.sortedInningPlayersByMaxBenched = [];
    this.gameService.gameInSession$.next(new Game());
    this.gameService.completeGame(this.currentGame?.id);
    this.loading$.next(false);
  }
  private removeLocalStorage() {
    const gameToRemove = window.localStorage.getItem("GameInSession");
    const gameCreatorToRemove = window.localStorage.getItem("GameCreator");
    if (gameToRemove) {
      window.localStorage.removeItem('GameInSession');
    }
    if (gameCreatorToRemove) {
      window.localStorage.removeItem('GameCreator');
    }
  }

  async checkIfGameInSessionAndAmITheCreator() {
    const isThereGameInSession = window.localStorage.getItem("GameInSession");
    if (isThereGameInSession) {
      const amGameCreator = window.localStorage.getItem("GameCreator");
      if (amGameCreator) {
        this.gameService.isGameCreator$.next(true);
      }
      let gameInSessionId = JSON.parse(isThereGameInSession).id;
      let teamId = JSON.parse(isThereGameInSession).teamId;
      const currentGameInSession = await this.gameService.getAnyActiveGameFromTeam(teamId)
      const currentInningInSession = await this.inningService.getActiveInningByGameId(gameInSessionId);
      const currentInningPlayersInSession = await this.inningService.getCurrentActiveInningPlayers(currentInningInSession.id);
      if (currentGameInSession && currentInningInSession && currentInningPlayersInSession) {
        this.inningService.addAnyNeededBenchPositions(currentInningPlayersInSession);
        this.gameService.currentGame$.next(currentGameInSession[currentGameInSession.length - 1]);
        this.inningService.currentInning$.next(currentInningInSession);
        this.inningService.currentInningPlayers$.next(currentInningPlayersInSession);
      } else {
          this.removeLocalStorage();
          this.gameService.currentGame$.next(new Game())
          this.inningService.currentInning$.next(new Inning())
          this.inningService.currentInningPlayers$.next([new InningPlayer()])
      }
    }
  }
  async newInningInserted(inning: Inning = new Inning()) {
      this.checkIfGameInSessionAndAmITheCreator();
  }
}
