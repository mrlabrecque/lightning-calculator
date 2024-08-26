import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { Inning } from '../models/inning';
import { InningPlayer } from '../models/inning-player';
import { Player } from '../models/player';
import { POSITIONS } from '../models/positions.';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class InningService {
  public positions: any[] = POSITIONS;
  currentInning$: BehaviorSubject<Inning> = new BehaviorSubject(new Inning())

  constructor(private supabaseService: SupabaseService, private messageService:MessageService) { }
  async createNewActiveInning(gameId: number) {
    await this.setAllOtherInningsInactive(gameId);
    const nextInningNumber = await this.getNextInningNumber(gameId);
    await this.insertNewActiveInning(gameId, nextInningNumber);
  }
  private async insertNewActiveInning(gameId: number, nextInningNumber: any) {
    const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .insert({ gameId: gameId, active: true, inningNumber: nextInningNumber })
      .select();
    if (data && data?.length > 0) {
      this.currentInning$.next(<Inning>data[0]);
    }
  }

  async getNextInningNumber(gameId: number) {
     const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .select()
      .eq('gameId', gameId)
    const numbers: number[] = data?.map(o => o.inningNumber) || [0];
    if (numbers && numbers?.length > 0) {
       return Math.max(...numbers) + 1;
    } else {
      return 1;
    }
  }
  async setAllOtherInningsInactive(gameId: number) {
    const { error } = await this.supabaseService.supabase
      .from('innings')
      .update({ active: false })
      .eq("gameId", gameId);
    this.currentInning$.next(new Inning());
  }
  async insertInningPlayers(inningPlayers: InningPlayer[], positions: any) {
    const inningPlayersToAdd: any[] = [];
    inningPlayers.forEach((player: InningPlayer, i) => {
      const tempPlayer = {
        inningId: player?.inning?.id,
        gameId: player?.inning?.gameId,
        playerId: player?.playerId,
        position: positions[i].value
      }
      inningPlayersToAdd.push(tempPlayer);
    });
    const { data, error } = await this.supabaseService.supabase
      .from('inningPlayers')
      .insert(inningPlayersToAdd)
      .select();
  }
  async getBenchNumberPlayer(gameId: number, players: Player[]) {
    const playerIds = players.map(player => player.id);
       const { data, error } = await this.supabaseService.supabase
      .from('inningPlayers')
      .select()
      .eq('gameId', gameId)
      .in('playerId', playerIds)
      .eq('position', 'B')
       return data;
  }
}
