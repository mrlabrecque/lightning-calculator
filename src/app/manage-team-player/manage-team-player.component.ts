import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Player } from '../models/player';
import { PlayerService } from '../services/player.service';
import { PositionRankingService } from '../services/position-ranking.service';

@Component({
  selector: 'app-manage-team-player',
  templateUrl: './manage-team-player.component.html',
  styleUrls: ['./manage-team-player.component.scss'],
})
export class ManageTeamPlayerComponent implements OnChanges {
  @Input() currentPlayer: Player = new Player();
  @Output() playerSaved: EventEmitter<boolean> = new EventEmitter();
  pitcherRankings = ['A', 'B', 'C', 'D'];
  positions: any[] = [];
  playerPositionRankings: any[] = [];

  playerForm = this.formBuilder.group({
    playerName: [''],
    pitcherRanking: [''],
    offensiveData: [''],
    defensiveData: [''],
    pitchingData: [''],
    rankings: this.formBuilder.array([])
  });

   get rankings() {
    return this.playerForm.get('rankings') as FormArray;
  }
  constructor(private positionRankingService: PositionRankingService,private cdr: ChangeDetectorRef, private formBuilder: FormBuilder,private playerService: PlayerService) {
  }  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPlayer']) {
      this.currentPlayer = { ...changes['currentPlayer'].currentValue }
      this.positionRankingService.getPositions().then(res => {
        this.positions = res;
        if (this.currentPlayer) {
          this.playerForm.controls.playerName.setValue(this.currentPlayer.Name || '')
          this.playerForm.controls.pitcherRanking.setValue(this.currentPlayer.PitchRanking || '')
          this.playerForm.controls.offensiveData.setValue(this.currentPlayer.OffensiveData || '')
          this.playerForm.controls.defensiveData.setValue(this.currentPlayer.DefensiveData || '')
          this.playerForm.controls.pitchingData.setValue(this.currentPlayer.PitchingData || '')
          this.positionRankingService.getPlayerPositionRankings(this.currentPlayer.id).then(res => this.onPlayerPositionRankingSuccess(res));
      }
      });

    }
  }
  onPlayerPositionRankingSuccess(res: any) {

    this.positions.forEach(pos => {
      const found = res.find((r:any) => r.position_id === pos.id);
      if (found) {
        this.rankings.push(this.formBuilder.control(found.score));
      } else {
        this.rankings.push(this.formBuilder.control(1));
      }
    })
  }
  async onSubmit() {
    const playerToUpdate: Player = {
      id: this.currentPlayer.id,
      Name: this.playerForm.value.playerName || '',
      OffensiveData: this.playerForm.value.offensiveData || '',
      DefensiveData: this.playerForm.value.defensiveData || '',
      PitchingData: this.playerForm.value.pitchingData || '',
      PitchRanking: this.playerForm.value.pitcherRanking || ''
    }
    const playerRankingsToUpdate: any = [];
    const rankings = this.playerForm.value.rankings;
    rankings?.forEach((rank: any, i) => {
      const rankObject = {
        player_id: this.currentPlayer.id,
        position_id: this.positions[i].id,
        score: rank
      }
      playerRankingsToUpdate.push(rankObject);
    })
    await this.playerService.updatePlayer(playerToUpdate);
    this.positionRankingService.upsertPositionRankings(playerRankingsToUpdate)
    this.playerSaved.emit(true);
  }
  onCancelClicked() {
    this.playerSaved.emit(true);
  }
}
