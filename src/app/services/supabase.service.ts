import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  public handleNewInningPlayers = (payload: any) => {
    console.log('Change received!', payload)
  }

  constructor() { 
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
      this.supabase
      .channel('table_db_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inningPlayers' },
        (payload) => console.log('Change received!', payload)
      )
      .subscribe()
  }
}
