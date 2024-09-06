import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { Game } from '../models/game';
import { Inning } from '../models/inning';
import { InningService } from './inning.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  isGameCreator$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  gameInSession$: BehaviorSubject<Game> = new BehaviorSubject(new Game());
  currentGame$: BehaviorSubject<Game> = new BehaviorSubject(new Game());
  currentGameSubscription: Subscription = this.currentGame$.pipe(filter((value) => !!value.id)).subscribe(res => this.inningService.createNewActiveInning(res.id))
  constructor(private supabaseService: SupabaseService, private inningService: InningService, private messageService: MessageService) { }
  async createNewGame(teamId: number) {
    await this.setAnyActiveGameForCurrentTeamToInactive(teamId);
    await this.insertNewActiveGame(teamId);
    this.isGameCreator$.next(true);

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
    await this.supabaseService.supabase
      .from('games')
      .update({ active: false })
       .eq("id", gameId);
      await this.supabaseService.supabase
      .from('innings')
      .update({ active: false })
      .eq("gameId", gameId);
    this.currentGame$.next(new Game());
    this.inningService.currentInning$.next(new Inning());
    this.messageService.add({ severity: 'success', summary: 'Game Complete' })

  }
  async getAnyActiveGameFromTeam(teamId: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('games')
      .select()
      .eq("teamId", teamId)
      .eq("active", true);
    return data;
  }
}
