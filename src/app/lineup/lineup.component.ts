import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { Game } from '../models/game';
import { Inning } from '../models/inning';
import { InningPlayerView } from '../models/inning-player';
import { Player } from '../models/player';
import { POSITIONS } from '../models/positions.';
import { AuthService } from '../services/auth.service';
import { GamesService } from '../services/games.service';
import { InningService } from '../services/inning.service';
import { PositionRankingService } from '../services/position-ranking.service';
import { RosterService } from '../services/roster.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss'],
})
export class LineupComponent {
  public positions: any[] = POSITIONS;
  newPositionsSubscription: Subscription = this.inningService.positions$
    .pipe(filter((value) => value.length > 10))
    .subscribe((res) => (this.positions = [...res]));
  newInningInsertedSubscription: Subscription =
    this.inningService.nextInningForViewerClicked$
      .pipe(filter((value) => value?.id > -1))
      .subscribe((res) => this.newInningInserted(res));
  gameInSessionSubscription: Subscription =
    this.gameService.gameInSession$.subscribe(
      (res) => (this.gameInSession = res.id > -1 ? res : null)
    );
  gameInSession: Game | null = null;
  currentGameSubscription: Subscription = this.gameService.currentGame$
    .pipe(filter((value) => !!value.id))
    .subscribe((res) => {
      this.currentGame = res;
    });
  currentGame: Game = new Game();
  currentInningSubscription: Subscription = this.inningService.currentInning$
    .pipe(filter((value) => value.id > -1))
    .subscribe((res) => this.onCurrentInningChanged(res));
  currentInning: Inning = new Inning();
  currentInningPlayersSubscription: Subscription =
    this.inningService.currentInningPlayers$
      .pipe(filter((value) => value.length > 1))
      .subscribe((res: InningPlayerView[]) => {
        this.onCurrentInningPlayersChanged(res);
      });
  currentInningPlayersView: InningPlayerView[] = [];
  currentGameRoster: Player[] = [];
  inningPlayersInningsPitchedLastThreeDaysSubscription: Subscription =
    this.inningService.currentInningPlayersInningsPitchedPerTeamLastThreeDays$
      .pipe(filter((value) => !!value))
      .subscribe((res) =>
        this.onCurrentInningPlayersInningPitchedLastThreeDaysChanged(res)
      );
  currentInningPlayersInningsPitchedPerTeamLastThreeDays: any[] = [];
  gameCreatorSubscription: Subscription =
    this.gameService.isGameCreator$.subscribe(
      (res) => (this.isGameCreator = res)
    );
  isGameCreator: boolean = false;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  splitButtonList = [
    {
      label: 'Complete Game',
      command: () => {
        this.completeGame();
      },
    },
  ];
  sortedInningPlayersByMaxBenched: any;
  allPlayersPositionRankings: any[] = [];
  currentInningPlayersWithPositionRankings: any[] = [];
  inningPercentGrade$: BehaviorSubject<number> = new BehaviorSubject(0);
  inningPercentSeverity: string = 'success';
  constructor(
    private messageService: MessageService,
    private gameService: GamesService,
    private inningService: InningService,
    private rosterService: RosterService,
    private teamService: TeamsService,
    private positionRankingService: PositionRankingService,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.checkIfGameInSessionAndAmITheCreator();
  }
  async createNewGame() {
    this.loading$.next(true);
    this.currentGameRoster = this.rosterService.getAllTeamPlayers();
    this.gameService.createNewGame(this.teamService.getCurrentTeamId());
  }
  onCurrentInningChanged(inning: Inning) {
    this.currentInning = inning;
  }
  async onCurrentInningPlayersChanged(inningPlayers: InningPlayerView[]) {
    await this.handleBenchStuff(inningPlayers);
    let sortedArray: InningPlayerView[] = [];
    let copiedInningPlayers: any[] = [...inningPlayers];
    this.positions.forEach((pos) => {
      const found = copiedInningPlayers.find(
        (ip) => ip.position === pos.value && !ip.found
      );
      if (found) {
        found.found = true;
        sortedArray.push(found);
      }
    });
    sortedArray.forEach((v: any) => delete v.found);
    this.currentInningPlayersView =
      sortedArray.length === inningPlayers.length ? sortedArray : inningPlayers;
    await this.calculateInningGrade();
    this.loading$.next(false);
  }
  onCurrentInningPlayersInningPitchedLastThreeDaysChanged(res: any) {
    this.currentInningPlayersInningsPitchedPerTeamLastThreeDays =
      this.mapInningsPitchedLastThreeDays(res);
  }

  private async handleBenchStuff(inningPlayers: InningPlayerView[]) {
    const numberOfBenchedInGame = await this.inningService.getBenchNumberPlayer(
      this.currentGame.id ?? 1,
      inningPlayers
    );
    inningPlayers.forEach(
      (ip) =>
        (ip.timesBenched = this.findBenchedRecords(
          ip.playerId,
          numberOfBenchedInGame
        ))
    );
    this.updateMostBenchedPlayers(inningPlayers);
  }
  findBenchedRecords(playerId: number = 0, benchedRecords: any) {
    const benchedTimes = benchedRecords?.filter(
      (rec: any) => rec.playerId === playerId
    );
    return benchedTimes?.length ?? 0;
  }

  updateMostBenchedPlayers(inningPlayers: InningPlayerView[]) {
    const copiedInningPlayers = [...inningPlayers];
    copiedInningPlayers.sort((a, b) => {
      return a.timesBenched && b.timesBenched
        ? b.timesBenched - a.timesBenched
        : 0;
    });
    this.sortedInningPlayersByMaxBenched = [...copiedInningPlayers].filter(
      (player) => (player.timesBenched ? player.timesBenched > 0 : 0)
    );
  }

  async submitInning() {
    if (this.currentInning) {
      this.currentInning.submitted = true;
      await this.inningService.updateInningToSubmitted(this.currentInning);
    }
    this.setPositionsOnPlayers();
    this.inningService
      .updateInningPlayers(this.currentInningPlayersView)
      .then(() => {
        //adding benched players before next inning to give coach a good view of actual status
        this.currentInningPlayersView.forEach((ip) => {
          if (ip.position === 'B') {
            ip.timesBenched++;
          }
        });
        this.updateMostBenchedPlayers(this.currentInningPlayersView);
        this.messageService.add({
          severity: 'success',
          summary: 'Inning Saved',
          detail: 'Start next inning or complete game',
        });
      });
  }
  setPositionsOnPlayers() {
    this.currentInningPlayersView.forEach(
      (inningPlayer: InningPlayerView, i) => {
        inningPlayer.position = this.positions[i].value;
      }
    );
  }
  onNextInningClicked() {
    this.inningService.createNewActiveInning(
      this.currentGame?.id,
      this.currentInningPlayersView
    );
  }

  async completeGame() {
    this.loading$.next(true);
    this.sortedInningPlayersByMaxBenched = [];
    this.gameService.gameInSession$.next(new Game());
    await this.gameService.completeGame(this.currentGame?.id);
    this.loading$.next(false);
  }

  async checkIfGameInSessionAndAmITheCreator() {
    this.loading$.next(true);
    const loggedUser = this.authService.loggedUser$.value;
    if (loggedUser) {
      const teamIdOfLoggedUser = loggedUser?.user_metadata?.associatedTeamId;
      const activeGame = await this.gameService.getAnyActiveGameFromTeam(
        teamIdOfLoggedUser
      );
      if (activeGame) {
        const amGameCreator = loggedUser.id === activeGame.game_owner;
        if (amGameCreator) {
          this.gameService.isGameCreator$.next(true);
        }
        const currentGameInSession =
          await this.gameService.getAnyActiveGameFromTeam(teamIdOfLoggedUser);
        const currentInningInSession =
          await this.inningService.getActiveInningByGameId(activeGame.id);
        const currentInningPlayersInSession =
          await this.inningService.getCurrentActiveInningPlayers(
            currentInningInSession.id
          );
        if (
          currentGameInSession &&
          currentInningInSession &&
          currentInningPlayersInSession
        ) {
          this.inningService.addAnyNeededBenchPositions(
            currentInningPlayersInSession
          );
          this.gameService.currentGame$.next(currentGameInSession);
          this.inningService.currentInning$.next(currentInningInSession);
          this.inningService.currentInningPlayers$.next(
            currentInningPlayersInSession
          );
        }
      } else {
        this.gameService.currentGame$.next(new Game());
        this.gameInSession = null;
        this.inningService.currentInning$.next(new Inning());
        this.inningService.currentInningPlayers$.next([new InningPlayerView()]);
        this.loading$.next(false);
      }
    } else {
      this.gameService.currentGame$.next(new Game());
      this.gameInSession = null;
      this.inningService.currentInning$.next(new Inning());
      this.inningService.currentInningPlayers$.next([new InningPlayerView()]);
      this.loading$.next(false);
    }
  }
  calculateInningsPitched(singleDay: boolean = false) {
    const currentTeamId = this.currentGame.teamId || -1;
    this.inningService.getPlayersInningPitchedLastThreeDays(
      currentTeamId,
      singleDay
    );
  }
  mapInningsPitchedLastThreeDays(res: any[]) {
    const mappedArray: any = [];
    res.forEach((player) => {
      const found = mappedArray.find(
        (ma: any) => ma.playerId === player.player_id
      );
      if (!found) {
        mappedArray.push({
          playerId: player.player_id,
          playerName: player.player_name,
          pitchingRanking: player.player_pitch_ranking,
          noOfInnings: 1,
        });
      } else {
        mappedArray[
          mappedArray.findIndex((el: any) => el.playerId === player.player_id)
        ].noOfInnings = found.noOfInnings + 1;
      }
    });
    return mappedArray;
  }
  getInningsPitchedByPlayerId(res: any, playerId: number) {
    return res.filter((re: any) => re.player_id === playerId).length;
  }
  filterToTodayClicked(event: any) {
    if (event.checked) {
      this.calculateInningsPitched(true);
    } else {
      this.calculateInningsPitched(false);
    }
  }
  drop(event: CdkDragDrop<string[]>) {
    this.currentInningPlayersView.splice(event.currentIndex, 0);
    const b = this.currentInningPlayersView[event.currentIndex];
    this.currentInningPlayersView[event.currentIndex] =
      this.currentInningPlayersView[event.previousIndex];
    this.currentInningPlayersView[event.previousIndex] = b;
    this.calculateInningGrade();
  }
  async newInningInserted(inning: Inning = new Inning()) {
    this.checkIfGameInSessionAndAmITheCreator();
  }
  async calculateInningGrade() {
    await this.positionRankingService
      .getPositionsAndWeights(this.currentInningPlayersView)
      .then((res: any) => (this.allPlayersPositionRankings = res));
    this.currentInningPlayersWithPositionRankings = [];
    this.currentInningPlayersView.forEach((inningPlayer, i) => {
      const positionId = i < 10 ? i + 1 : 10;
      const foundPlayer = this.allPlayersPositionRankings.find(
        (pos: any) =>
          pos.player_id === inningPlayer.playerId &&
          pos.position_id === positionId &&
          pos.team_id === this.currentGame.teamId
      );
      this.currentInningPlayersWithPositionRankings.push(foundPlayer);
    });
    const scores: number =
      this.currentInningPlayersWithPositionRankings?.reduce(
        (accumulator, currentValue) =>
          accumulator + (currentValue?.weighted_score || 1),
        0
      );
    const maxValue: number =
      this.currentInningPlayersWithPositionRankings?.reduce(
        (accumulator, currentValue) =>
          accumulator + currentValue.position_weight * 5,
        0
      );
    const percent = Math.round((scores / maxValue) * 100);
    this.inningPercentGrade$.next(percent);
    switch (true) {
      case percent > 85:
        this.inningPercentSeverity = 'p-badge-success';
        break;
      case percent > 70:
        this.inningPercentSeverity = 'p-badge-warning';
        break;
      case percent < 70:
        this.inningPercentSeverity = 'p-badge-danger';
        break;
      default:
        this.inningPercentSeverity = 'p-badge-success';
        break;
    }
  }
  async pitcherChangedFromDropdown(selectedPitcher: any) {
    if (!!selectedPitcher) {
      const tempCurrentInningPlayersView = [...this.currentInningPlayersView];
      tempCurrentInningPlayersView.forEach(
        (tempPlayer) => (tempPlayer.position = '')
      );
      const tempPitcher = tempCurrentInningPlayersView.find(
        (temp) => temp.playerId === selectedPitcher.playerId
      );
      if (tempPitcher) {
        tempPitcher.position = 'P';
      }

      let benchedPositionRankForEachPlayer = this.allPlayersPositionRankings
        .filter((allPlay) => allPlay.position_name === 'B')
        .sort((a, b) => b.player_position_score - a.player_position_score);
      benchedPositionRankForEachPlayer.forEach((ranks) => {
        ranks.times_benched =
          this.sortedInningPlayersByMaxBenched.find(
            (benched: any) => benched.playerId === ranks.player_id
          )?.timesBenched || 0;
      });
      const previousInningPlayers = await this.inningService
        .getPreviousInningPlayers(this.currentInning)
        .then((res) => {
          return res.filter((r) => r.position === 'B');
        });
      const lastInningBenchedIds = previousInningPlayers.map(
        (ip) => ip.playerId
      );

      //set benched postisions
      let benchedPlayers = 0;
      benchedPositionRankForEachPlayer.forEach((benchPos) => {
        if (this.positions.length - benchedPlayers > 9) {
          const wasPlayerBenchedLastInning = lastInningBenchedIds.includes(
            benchPos.player_id
          );
          if (!wasPlayerBenchedLastInning) {
            const tempBench = tempCurrentInningPlayersView.find(
              (temp) => temp.playerId === benchPos.player_id
            );
            if (tempBench && tempBench.position === '') {
              tempBench.position = 'B';
              benchedPlayers++;
            }
          }
        }
      });
      //   console.log(tempCurrentInningPlayersView);
      this.positions.forEach((pos) => {
        const takenPosition = tempCurrentInningPlayersView.filter(
          (mapped) => !!mapped.position
        );
        const takenPositionLetters = takenPosition.map((map) => map.position);
        const isPositionInLoopTaken = takenPositionLetters.includes(pos.value);
        if (!isPositionInLoopTaken) {
          const bestPlayersInPosition = this.allPlayersPositionRankings
            .filter((appr) => appr.position_name === pos.value)
            .sort((a, b) => b.player_position_score - a.player_position_score);
          let found = false;
          let index = 0;
          while (!found) {
            let findPlayerInTempArray: any = tempCurrentInningPlayersView.find(
              (temp) => temp.playerId === bestPlayersInPosition[index].player_id
            );
            if (!!findPlayerInTempArray.position) {
              index++;
            } else {
              found = true;
              findPlayerInTempArray.position = pos.value;
            }
          }
        }
      });
      this.currentInningPlayersView = [];
      this.positions.forEach((pos) => {
        if (pos.value !== 'B') {
          const foundItem = tempCurrentInningPlayersView.find(
            (tempPlayer) => tempPlayer.position === pos.value
          );
          if (foundItem) {
            this.currentInningPlayersView.push(foundItem);
          }
        }
      });
      const benchPlayersToPush = tempCurrentInningPlayersView.filter(
        (tempPlayer) => tempPlayer.position === 'B'
      );
      benchPlayersToPush.forEach((player) => {
        this.currentInningPlayersView.push(player);
      });
      this.inningService.currentInningPlayers$.next(
        this.currentInningPlayersView
      );
    }
  }
}
