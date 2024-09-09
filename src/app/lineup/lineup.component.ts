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
  newInningPlayerInsertedSubscription: Subscription = this.inningService.newInningPlayerInserted$
     .pipe(filter((value) => value?.id > -1))
    .subscribe(res => this.newInningPlayerInserted(res))
  gameInSessionSubscription: Subscription = this.gameService.gameInSession$.subscribe(res => this.gameInSession = res.id > -1 ?  res : null);
  gameInSession: Game | null = null;
  currentGameSubscription: Subscription = this.gameService.currentGame$
    .pipe(filter(value => !!value.id))
    .subscribe(res => {
      this.currentGame = res

    })
  currentGame: Game = new Game(); 
  currentInningSubscription: Subscription = this.inningService.currentInning$
    .pipe(filter((value) => !!value.id))
    .subscribe(res => this.onCurrentInningChanged(res))
  currentInning: Inning = new Inning(); 

  currentInningPlayers$: BehaviorSubject<InningPlayer[]> = new BehaviorSubject([new InningPlayer()]);
  currentInningPlayers: InningPlayer[] = [];
  currentGameRoster: Player[] = [];
  currentInningNumber$: BehaviorSubject<number> = new BehaviorSubject(1);
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
    await this.gameService.createNewGame(this.teamService.getCurrentTeamId());
    this.currentGameRoster = this.rosterService.getAllTeamPlayers();
    this.addAnyBenchPositionsNeeded();
  }
  onCurrentInningChanged(inning: Inning) {
    this.currentInning = inning;
    if (this.currentInning.id > 0) {
      this.currentInningNumber$.next(this.currentInning.inningNumber);
      this.createInningPlayers();
    }
  }
  async createInningPlayers() {
    const currentPlayers = [...this.currentGameRoster];
    const numberOfBenchedInGame = await this.inningService.getBenchNumberPlayer(this.currentGame.id ?? 1, currentPlayers)
    let tempInningPlayers: InningPlayer[] = [];
    if (this.currentInning.inningNumber === 1 && !this.currentInning.submitted) {
      if (currentPlayers.length > 0) {
        currentPlayers.forEach(player => {
          const newInningPlayerObject: InningPlayer = {
            id: -1,
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
        player.timesBenched = this.findBenchedRecords(player.playerId, numberOfBenchedInGame)
        player.inning = this.currentInning;
      })
    }
    this.currentInningPlayers = [...tempInningPlayers];
    this.currentInningNumber$.next(this.currentInning.inningNumber);
    this.updateMostBenchedPlayers();
    this.loading$.next(false);
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
    this.inningService.createNewActiveInning(this.currentGame?.id);
  }
  findBenchedRecords(playerId: number = 0, benchedRecords: any) {
    const benchedTimes = benchedRecords?.filter((rec:any) => rec.playerId === playerId)
    return benchedTimes?.length ?? 0
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

  async joinGame() {
    window.localStorage.setItem("GameInSession", JSON.stringify(this.gameInSession));
    this.currentGame = <Game>this.gameInSession;
    this.rosterService.setSelectedRoster(this.currentGame.teamId)
    const currentActiveInningId: any = await this.inningService.getCurrentActiveInningId(this.currentGame.id);
    const currentActiveInning: any = await this.inningService.getInningById(currentActiveInningId);
    const currentActiveInningPlayers: InningPlayer[] = await this.inningService.getCurrentActiveInningPlayers(currentActiveInningId);
    if (currentActiveInningId) {
      const currentRoster = this.rosterService.getAllTeamPlayers();
      this.currentInning = currentActiveInning;
      this.currentGameRoster = [...currentRoster];
      this.currentInningPlayers = this.mapServerInningPlayerToLocalInningPlayer(currentActiveInningPlayers);
      this.createInningPlayers()
      this.addAnyBenchPositionsNeeded();
    }
  }
  checkIfGameInSessionAndAmITheCreator() {
    const gameInSession = window.localStorage.getItem("GameInSession");
    const amGameCreator = window.localStorage.getItem("GameCreator");
    if (amGameCreator) {
      this.gameService.isGameCreator$.next(true);
    }
    if (gameInSession) {
      this.gameService.getAnyActiveGameFromTeam(this.teamService.getCurrentTeamId()).then(res => {
      if (res?.length) {
        this.gameService.gameInSession$.next(JSON.parse(gameInSession));
        this.joinGame();
      } else {
        this.removeLocalStorage();
      }
      }) 
    }
  }
  mapServerInningPlayerToLocalInningPlayer(inningPlayersFromServer: InningPlayer[]) {
    inningPlayersFromServer.forEach((ipFromServer: InningPlayer) => {
      ipFromServer.inning = this.currentInning;
      ipFromServer.playerName = this.currentGameRoster.find(player => player.id === ipFromServer.playerId)?.Name
    });
    return inningPlayersFromServer;
  }
  newInningPlayerInserted(inningPlayer: InningPlayer = new InningPlayer()) {
    const currentInningId = this.currentInning?.id;
    if (!this.isGameCreator) {
      this.currentInningPlayers = [];
      const inningPlayerInningId = inningPlayer.inning.id;
      if (inningPlayerInningId === currentInningId) {
        while (this.currentInningPlayers.length < this.currentGameRoster.length) {
            this.currentInningPlayers.push(inningPlayer);
        }
        if (this.currentInningPlayers.length === this.currentGameRoster.length) {
            this.currentInningPlayers = this.mapServerInningPlayerToLocalInningPlayer(this.currentInningPlayers);
            this.createInningPlayers()
            this.addAnyBenchPositionsNeeded();
        }
      }
    }
  }
}
