import { Component } from '@angular/core';
import { Game } from '../models/game';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-lineup',
  templateUrl: './lineup.component.html',
  styleUrls: ['./lineup.component.scss']
})
export class LineupComponent {

  currentGame: Game | undefined; 
  constructor(private supabaseService: SupabaseService) {
  }
  async createNewGame() {
    const {data } = await this.supabaseService.supabase
      .from('games')
      .select();
    this.currentGame = <Game>data;
  }
}
