import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RosterService {

  currentRoster$: BehaviorSubject<Player[]> = new BehaviorSubject([new Player()]);

  constructor(private supabaseService: SupabaseService) { 
  }
  getAllTeamPlayers(): Player[] {
    return this.currentRoster$.value;
  }
  getPlayerById(id: number): Player | undefined {
    const currentRoster = this.currentRoster$.value;
    return currentRoster.find(player => player.Id === id);
  }
  async setSelectedRoster(id: number | undefined): Promise<void> {
    const { data, error } = await this.supabaseService.supabase.from('players').select().eq("TeamId", id);
    this.currentRoster$.next(<Player[]>data);
  }
}
