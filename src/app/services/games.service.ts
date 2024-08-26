import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { Game } from '../models/game';
import { InningService } from './inning.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  currentGame$: BehaviorSubject<Game> = new BehaviorSubject(new Game())
  currentGameSubscription: Subscription = this.currentGame$.pipe(filter((value) => !!value.id)).subscribe(res => this.inningService.createNewActiveInning(res.id))
  constructor(private supabaseService: SupabaseService, private inningService: InningService) { }
  async createNewGame(teamId: number) {
    await this.setAnyActiveGameForCurrentTeamToInactive(teamId);
    await this.insertNewActiveGame(teamId);
  }
  async insertNewActiveGame(teamId: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('games')
      .insert({ teamId: teamId, active: true })
      .select();
    if (data && data?.length > 0) {
      this.currentGame$.next(<Game>data[0]);
    }
  }

  async setAnyActiveGameForCurrentTeamToInactive(teamId: number) {
    const { error } = await this.supabaseService.supabase
      .from('games')
      .update({ active: false })
      .eq("teamId", teamId);
  }
  async completeGame(gameId: number) {
     const { error } = await this.supabaseService.supabase
      .from('games')
      .update({ active: false })
       .eq("id", gameId);
    this.inningService.setAllOtherInningsInactive(gameId);
    this.currentGame$.next(new Game());
  }
}
