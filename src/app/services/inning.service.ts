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
  positions: any[] = POSITIONS;
  positions$: BehaviorSubject<any[]> = new BehaviorSubject(this.positions);
  currentInning$: BehaviorSubject<Inning> = new BehaviorSubject(new Inning())
  // Create a function to handle inserts
  nextInningForViewerClicked$: BehaviorSubject<Inning> = new BehaviorSubject(new Inning());

  currentInningPlayers$: BehaviorSubject<InningPlayer[]> = new BehaviorSubject([new InningPlayer()]);

  constructor(private supabaseService: SupabaseService, private messageService: MessageService) {
    this.supabaseService.supabase
      .channel('table_db_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'innings' },
        (payload) => this.newInningInserted(<Inning>payload.new)
      )
      .subscribe()
  }
  async createNewActiveInning(gameId: number, inningPlayers: InningPlayer[]) {
    await this.setAllOtherInningsInactive(gameId);
    const nextInningNumber = await this.getNextInningNumber(gameId);
    this.createNewInningAndInningPlayers(gameId, inningPlayers, nextInningNumber);
  }
 async createNewInningAndInningPlayers(gameId: number, inningPlayers: InningPlayer[], nextInningNumber: number = 1) {
    const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .insert({ gameId: gameId, active: true, inningNumber: nextInningNumber })
      .select();
    if (data && data?.length > 0) {
      this.currentInning$.next(<Inning>data[0])
      this.createInningPlayers(<Inning>data[0], inningPlayers)
    }
  }
  async createInningPlayers(inning: Inning, inningPlayers: InningPlayer[]) {
      if (inningPlayers.length > 10) {
        this.addAnyNeededBenchPositions(inningPlayers);
      }
      const inningPlayersToAdd: any[] = [];
      inningPlayers.forEach(async (player: any, i) => {
        const tempInningPlayer: InningPlayer = {
          inningId: inning.id,
          gameId: inning.gameId,
          playerName: inning.inningNumber === 1 ? player.Name : player.playerName,
          playerId: inning.inningNumber === 1 ? player.id : player.playerId,
          position: "",
        }
        inningPlayersToAdd.push(tempInningPlayer);
      })
      this.insertInningPlayers(inningPlayersToAdd)
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
    public addAnyNeededBenchPositions(data: any[]) {
    const newPostisions = this.addAnyBenchPositionsNeeded(data.length, this.positions);
    this.positions$.next(newPostisions);
  }
  async getCurrentActiveInningId(gameId: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .select('id')
      .eq('gameId', gameId)
      .eq('active', true)
    if (data && data?.length > 0) {
      return data[0].id;
    } else {
      return -1;
    }
  }
  async getInningById(inningId: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .select()
      .eq('id', inningId)
    if (data && data?.length > 0) {
      return <Inning>data[0];
    } else {
      return new Inning();
    }
  }
    async getActiveInningByGameId(gameId: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .select()
      .eq('gameId', gameId)
      .eq('active', true)
    if (data && data?.length > 0) {
      return <Inning>data[0];
    } else {
      return new Inning();
    }
  }
  async setAllOtherInningsInactive(gameId: number) {
    const { error } = await this.supabaseService.supabase
      .from('innings')
      .update({ active: false })
      .eq("gameId", gameId);
  }
  // async insertInningPlayers(inningPlayers: InningPlayer[], positions: any) {
  //   const inningPlayersToAdd: any[] = [];
  //   inningPlayers.forEach((player: InningPlayer, i) => {
  //     const tempPlayer = {
  //       inningId: player?.inning?.id,
  //       gameId: player?.inning?.gameId,
  //       playerId: player?.playerId,
  //       position: positions[i].value
  //     }
  //     inningPlayersToAdd.push(tempPlayer);
  //   });
  //   const { data, error } = await this.supabaseService.supabase
  //     .from('inningPlayers')
  //     .insert(inningPlayersToAdd)
  //     .select();
  // }
  async insertInningPlayers(inningPlayersToAdd: InningPlayer[]) {
    const { data, error } = await this.supabaseService.supabase
      .from('inningPlayers')
      .insert(inningPlayersToAdd)
    this.currentInningPlayers$.next(inningPlayersToAdd);
  }
  async updateInningPlayers(inningPlayers: InningPlayer[]) {
    inningPlayers.forEach(async (player: InningPlayer, i) => {
      await this.supabaseService.supabase
        .from('inningPlayers')
        .update({ position: player.position })
        .eq('inningId', player.inningId)
        .eq('playerId', player.playerId)
    });
  }
  async getCurrentActiveInningPlayers(inningId: number) {
    const { data, error } = await this.supabaseService.supabase
      .from('inningPlayers')
      .select()
      .eq('inningId', inningId)
    if (data && data?.length > 0) {
      return <InningPlayer[]>data;
    } else {
      return [new InningPlayer()]
    }
  }
  async getBenchNumberPlayer(gameId: number, players: InningPlayer[]) {
    const playerIds = players.map(player => player.playerId);
    const { data, error } = await this.supabaseService.supabase
      .from('inningPlayers')
      .select()
      .eq('gameId', gameId)
      .in('playerId', playerIds)
      .eq('position', 'B')
    return data;
  }
  async updateInningToSubmitted(inning: Inning) {
    const { data, error } = await this.supabaseService.supabase
      .from('innings')
      .update({ submitted: true })
      .eq('id', inning.id);
  }
  newInningInserted(inning: Inning) {
    const isGameCreator = window.localStorage.getItem("GameCreator");
    if (!isGameCreator) {
      this.nextInningForViewerClicked$.next(inning);
    }
  }
  
  public createTempInningPlayersForNewGame(currentPlayers: Player[], numberOfBenchedInGame: any[] | null) {
    let tempInningPlayers: InningPlayer[] = [];
    if (currentPlayers.length > 0) {
      currentPlayers.forEach(player => {
        const newInningPlayerObject: InningPlayer = {
          id: -1,
          inning: this.currentInning$.value,
          playerName: player.Name,
          playerId: player.id,
          position: '',
          timesBenched: this.findBenchedRecords(player?.id, numberOfBenchedInGame)
        };
        tempInningPlayers.push(newInningPlayerObject);
      });
    }
    return tempInningPlayers;
  }
  findBenchedRecords(playerId: number = 0, benchedRecords: any) {
    const benchedTimes = benchedRecords?.filter((rec:any) => rec.playerId === playerId)
    return benchedTimes?.length ?? 0
  }
  public addAnyBenchPositionsNeeded(length: number, positions: any) {
    if (length > 10) {
      let numberOfBenchToAdd = length - 10;
      while (numberOfBenchToAdd > 0
        && length != positions.length
      ) {
        positions.push({
          "label": "B",
          "value": "B",
        });
        numberOfBenchToAdd--;
      }
    }
    return positions;
  }
  
}
