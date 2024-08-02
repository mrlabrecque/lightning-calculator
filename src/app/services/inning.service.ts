import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game';
import { Inning } from '../models/inning';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class InningService {
  currentInning$: BehaviorSubject<Inning> = new BehaviorSubject(new Inning())

  constructor(private supabaseService: SupabaseService) { }
  async insertNewActiveInning(game: Game) {
     const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .insert({ gameId: game.id, active: true })
       .select();
    if (data && data?.length > 0) {
        this.currentInning$.next(<Inning>data[0]);
    }
  }
}
