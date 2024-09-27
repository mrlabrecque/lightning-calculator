import { Injectable } from '@angular/core';
import { InningPlayerView } from '../models/inning-player';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PositionRankingService {

  constructor(private supabaseService: SupabaseService) { 
  }
  async getPositions() {
    const { data, error } = await this.supabaseService.supabase.from('positions').select();
    if (data) {
      return data;
    } else {
      return [];
    }
  }
  async getPositionsAndWeights(inningPlayersView: InningPlayerView[]) {
    const mappedPlayerIds = inningPlayersView.map(plater => plater.playerId);
    const { data, error } = await this.supabaseService.supabase.from('team_player_position_score_view').select().in('player_id', mappedPlayerIds);
    if (data) {
      return data;
    } else {
      return [];
    }
  }
    async getPlayerPositionRankings(playerId: number) {
    const { data, error } = await this.supabaseService.supabase.from('position_player_weights').select().eq('player_id', playerId);
    if (data) {
      return data;
    } else {
      return [];
    }
    }
      async getPlayerPositionRank(playerId: number, positionId: number) {
    const { data, error } = await this.supabaseService.supabase.from('position_player_weights').select().eq('player_id', playerId).eq('position_id', positionId);
    if (data && data?.length > 0) {
      return data[0];
    } else {
      return 3;
    }
    }
   upsertPositionRankings(rankingsToUpdate: any) {
     rankingsToUpdate.forEach(async (rank: any) => {
       const { data, error } = await this.supabaseService.supabase.from('position_player_weights').select('id').eq('player_id', rank.player_id).eq('position_id', rank.position_id)
       if (!!data && data?.length > 0) {
         this.updatePositioRanking(rank);
       } else {
         this.insertPositioRanking(rank);
       }
     })
  } 
  async insertPositioRanking(rank: any) {
    const { data, error } = await this.supabaseService.supabase.from('position_player_weights').insert(rank);
  }
    async updatePositioRanking(rank: any) {
      const { data, error } = await this.supabaseService.supabase.from('position_player_weights').update({ 'score': rank.score }).eq('player_id', rank.player_id).eq('position_id', rank.position_id)
  }
}
