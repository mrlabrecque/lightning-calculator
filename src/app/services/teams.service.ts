import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { Team } from '../models/team';
import { RosterService } from './roster.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  allTeams$: BehaviorSubject<Team[]> = new BehaviorSubject([new Team()]);
  currentTeam$: BehaviorSubject<Team> = new BehaviorSubject(new Team());
  teamChangeSubscription: Subscription = this.currentTeam$
    .pipe(filter((value) => value.id !== undefined))
    .subscribe((res: Team) => this.rosterService.setSelectedRoster(res.id));

  constructor(
    private supabaseService: SupabaseService,
    private rosterService: RosterService
  ) {}

  getAllTeams(): Team[] {
    return this.allTeams$.value;
  }
  getCurrentTeam(): Team {
    return this.currentTeam$.value;
  }
  getCurrentTeamId(): number {
    const currentTeam = this.currentTeam$.value;
    return currentTeam.id ?? 0;
  }
  async setAllTeams() {
    let { data, error } = await this.supabaseService.supabase
      .from('teams')
      .select();
    this.allTeams$.next(<Team[]>data);
  }
  async setCurrentTeam(id: number) {
    let { data, error } = await this.supabaseService.supabase
      .from('teams')
      .select()
      .eq('id', id);
    if (data && data?.length > 0) {
      this.currentTeam$.next(<Team>data[0]);
    }
  }

  async updateTeamProfile(updatedTeamProfile: any) {
    const { data, error } = await this.supabaseService.supabase
      .from('teams')
      .upsert(updatedTeamProfile)
      .select();
    console.log(error);
  }
}
