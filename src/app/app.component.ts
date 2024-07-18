import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import * as _ from 'lodash';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { environment } from '../environment';
import { Player } from './models/player';
import { STATS } from './models/stats';
import { Team } from './models/team';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
   encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  private supabase: SupabaseClient;
  public title = 'Lightning-Calculator';
  public teams: Team[] = [];
   public players: Player[] = [];
  public selectedTeam: any = { id: 1, name: "Name" };
  public selectedPlayers: any = [{
    Id: 1,
    TeamId: 0,
    Name: "",
    OffensiveData: ""
  }
  ]
  public dataForGraph: any[] = [];
  public stats: any[] = STATS;
  public filteredStats: any[] = [];
  public statToGraph: any = "AB";

  public chartOptions: any;
  public chartData: any;
  public error = {}
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
  public ngOnInit() {
    this.getTeams();
    this.setChartOptions();
  }
  async getTeams() {
    const {data} = await this.supabase
      .from('teams')
      .select();
    this.teams = <Team[]>data;

  }
    async onTeamSelectChange() {
   const { data, error } = await this.supabase.from('players').select().eq("TeamId", this.selectedTeam.id);
    this.players = <Player[]>data;
  }
  setChartOptions() {
        this.chartOptions = {
            stacked: false,
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: "#000"
                    }
                }
            },
            scales: {
                x: {
                ticks: {
                  color: "#000"
                },
                    grid: {
                        color: "#000"
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: "#000"
                    },
                    grid: {
                        color: "#000"
                    }
                }
            }
    };
  }

  onPlayerSelectChange(players: Player[]) {
    this.selectedPlayers = players;
  }
  onStatSelectChange(stat: string) {
    this.statToGraph = stat;
  }
    filterStats(event: AutoCompleteCompleteEvent) {
        let filtered: any[] = [];
        let query = event.query;
        for (const element of this.stats) {
            let stat = element;
            if (stat.label.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(stat);
            }
        }
        this.filteredStats = filtered;
    }
  refreshChartData() {
    this.dataForGraph = [];
    this.selectedPlayers.forEach((play: any) => {
      const data: any[] = JSON.parse(play.OffensiveData);
      data.forEach(dat => {
           const gameData: any = {
             GameDate: dat.game_date,
             PlayerName: play.Name,
             PlayerStats : dat.player_stats.stats
           }
        this.dataForGraph.push(gameData);
      });
    });
    this.dataForGraph.sort((a,b)=>new Date(a.GameDate).getTime()-new Date(b.GameDate).getTime())
    const groupedByPlayerName = _.groupBy(this.dataForGraph, (data: any) => data.PlayerName) || [];
    const dataSets = _.map(groupedByPlayerName, (grp, i) => {
     return {
        label: grp[0].PlayerName,
        data: grp.map((gr: any) => gr.PlayerStats.offense[this.statToGraph]),
        fill: false,
        yAxisID: 'y',
       tension: 0.4,
          trendlineLinear: {
                style: "rgb(43 ,66 ,255, 0.3)",
                lineStyle: "dotted",
                width: 2
            }
      }
    })
    const labels = _.map(_.uniqBy(this.dataForGraph, dat => dat.GameDate), item => item.GameDate);
      this.chartData = {
            labels: labels,
            datasets: dataSets
        };
  }
  onSubmit() {
    this.refreshChartData();
  } 
}



