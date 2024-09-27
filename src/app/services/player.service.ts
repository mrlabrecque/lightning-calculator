import { Injectable } from '@angular/core';
import { Player } from '../models/player';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private supabaseService: SupabaseService) { }
  async updatePlayer(playerToUpdate: Player) {
      await this.supabaseService.supabase
        .from('players')
        .update(playerToUpdate)
        .eq('id', playerToUpdate.id)
  }
}
