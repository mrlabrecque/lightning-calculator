import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game';
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
  async insertNewActiveInning(game: Game) {
    await this.setAllOtherInningsInactive(game);
    const nextInningNumber = await this.getNextInningNumber(game);
     const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .insert({ gameId: game.id, active: true, inningNumber: nextInningNumber })
      .select();
    if (data && data?.length > 0) {
        this.currentInning$.next(<Inning>data[0]);
    }
  }
  async getNextInningNumber(game: Game) {
     const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .select()
      .eq('gameId', game.id)
    const inningWithMaxInningNumber = data?.find(dat => Math.max(dat.inningNumber));
    if (inningWithMaxInningNumber) {
      return inningWithMaxInningNumber.inningNumber + 1;
    } else {
      return 1
    }
  }
  async setAllOtherInningsInactive(game: Game) {
    const { error } = await this.supabaseService.supabase
      .from('innings')
      .update({ active: false })
      .eq("gameId", game.id);
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
