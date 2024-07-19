import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ChartOptions } from "chart.js";
import * as _ from 'lodash';
import { FilterService } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { environment } from '../environment';
import { MONTHS } from './models/months';
import { Player } from './models/player';
import { STATS } from './models/stats';
import { Team } from './models/team';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class AppComponent implements OnInit {
  private supabase: SupabaseClient;
  public title = 'Lightning-Calculator';
  public teams: Team[] = [];
   public players: Player[] = [];
  public selectedTeam: any = { };
  public selectedPlayers: any = []
  public buttonOptions: any[] = [{ label: 'By Game', value: 'game' }, { label: 'Month Avg.', value: 'month' }, { label: 'Totals', value: 'totals' }];
  public selectedButton: any = 'game';
  public dataForGraph: any[] = [];
  public stats: any[] = STATS;
   public months: any[] = MONTHS;
  public filteredStats: any[] = [];
  public statToGraph: any = "AB";
  public statCategory: string = "offense";

  public chartOptions: ChartOptions = {};
  public chartData: any;
  public error = {}
  constructor(private filterService: FilterService,private datePipe: DatePipe) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }
  public ngOnInit() {
    this.getTeams();
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


  onPlayerSelectChange(players: Player[]) {
    this.selectedPlayers = players;
  }
  onStatSelectChange(stat: any) {
    this.statCategory = stat.category;
    this.statToGraph = stat.value;
  }
    filterStats(event: AutoCompleteCompleteEvent) {
        let filtered: any[] = [];
        let query = event.query;
              for (const optgroup of this.stats) {
            let filteredSubOptions = this.filterService.filter(optgroup.items, ['label'], query, "contains");
            if (filteredSubOptions && filteredSubOptions.length) {
                filtered.push({
                    label: optgroup.label,
                    value: optgroup.value,
                    items: filteredSubOptions
                });
            }
          }
         this.filteredStats = filtered;
    }
  refreshChartDataPerGame() {
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
        data: grp.map((gr: any) => gr.PlayerStats[this.statCategory] && gr.PlayerStats[this.statCategory][this.statToGraph]),
        fill: false,
        yAxisID: 'y',
        tension: 0.4,
        trendlineLinear: {
          style: "rgb(43 ,66 ,255, 0.3)",
          lineStyle: "dotted",
          width: 2
        }
      }
    });
    const labels = _.map(_.uniqBy(this.dataForGraph, dat => dat.GameDate), item => this.datePipe.transform(item.GameDate));
      this.chartData = {
            labels: labels,
            datasets: dataSets
        };
  }
  refreshChartDataPerMonth() {
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
    this.dataForGraph.sort((a, b) => new Date(a.GameDate).getTime() - new Date(b.GameDate).getTime());
    const rawDataSets: any[] = [];
    const groupedByPlayerName = _.groupBy(this.dataForGraph, (data: any) => data.PlayerName) || [];
    _.forEach(groupedByPlayerName, (playerGames: any[], i) => {
        const groupedByPlayerNameAndMonth = _.groupBy(playerGames, (data: any) => new Date(data.GameDate).getMonth()) || [];
        _.forEach(groupedByPlayerNameAndMonth, (monthlyGames:any) => {
          let avgMonthStat: number = 0;
          const month = new Date(monthlyGames[0].GameDate).getMonth();
          const playerName = monthlyGames[0].PlayerName;
          _.forEach(monthlyGames, monthlyGame => {
            let indivGameStat: number = monthlyGame.PlayerStats[this.statCategory] && monthlyGame.PlayerStats[this.statCategory][this.statToGraph];
            if (indivGameStat === undefined) {
              indivGameStat = 0;
            }
            avgMonthStat = avgMonthStat + indivGameStat;
          });
          rawDataSets.push({
            Name: playerName,
            Month: month,
            Value: avgMonthStat / monthlyGames.length
          });   
        })
      });
       

      const rawGroupedByPlayerName = _.groupBy(rawDataSets, (data: any) => data.Name) || [];
      const dataSets = _.map(rawGroupedByPlayerName, (grp, i) => {
      return {
        label: grp[0].Name,
        data: grp.map((gr: any) => gr.Value),
        fill: false,
        yAxisID: 'y',
        tension: 0.4,
        trendlineLinear: {
          style: "rgb(43 ,66 ,255, 0.3)",
          lineStyle: "dotted",
          width: 2
        }
      }
    });
    const labels = _.map(_.uniqBy(rawDataSets, dat => dat.Month), item => this.months[item.Month]);
      this.chartData = {
            labels: labels,
            datasets: dataSets
        };
    }
    refreshChartDataTotals() {
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
        data: grp.map((gr: any) => gr.PlayerStats[this.statCategory][this.statToGraph]),
        fill: false,
        yAxisID: 'y',
        tension: 0.4,
        trendlineLinear: {
          style: "rgb(43 ,66 ,255, 0.3)",
          lineStyle: "dotted",
          width: 2
        }
      }
    });
    const labels = _.map(_.uniqBy(this.dataForGraph, dat => dat.GameDate), item => item.GameDate);
      this.chartData = {
            labels: labels,
            datasets: dataSets
        };
    }
    setLineChartOptions() {
        this.chartOptions = {
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
                  color: "#000",
                },
                    grid: {
                        color: "#ddd"
                    }
                },
              y: {
                    beginAtZero: true,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                      color: "#000",
                    },
                    grid: {
                        color: "#ddd"
                    }
                }
            }
    };
  }
  onSubmit() {
    switch (this.selectedButton) {
      case 'game':
        this.setLineChartOptions()
        this.refreshChartDataPerGame();
        break;
      case 'month':
        this.setLineChartOptions();
        this.refreshChartDataPerMonth();
        break;
      case 'totals':
        this.refreshChartDataTotals();
        break;
      default:
        this.refreshChartDataPerGame();
        break;
    }
  } 
}



