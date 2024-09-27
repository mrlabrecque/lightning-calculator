import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivePageService } from './services/active-page.service';
import { LoaderService } from './services/loader.service';
import { TeamsService } from './services/teams.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class AppComponent implements OnInit {
  private activePageSubscription: Subscription | undefined = undefined;
  private currentTeamSubscription: Subscription | undefined = undefined;
  public currentTeam: any; 
  public activePage: string | undefined = "stats";
  public activePageTitle: string = "Home";
  public title = 'Lightning-Calculator';
  public pageLoading = false;
  constructor(private activePageService: ActivePageService, private teamService: TeamsService, private loaderService: LoaderService) {
  }
  ngOnInit(): void {
    this.setAllTeams();
    this.getActivePageInLocalStorage();
    this.activePageSubscription = this.activePageService.activePage$.subscribe((pageChanged: any) => this.onActivePageChanged(pageChanged));
    this.activePageSubscription = this.loaderService.pageLoading$.subscribe((res: any) => this.pageLoading = res);
    this.currentTeamSubscription = this.teamService.currentTeam$.subscribe((res: any) => this.currentTeam = res);
  }
  async setAllTeams() {
    this.teamService.setAllTeams();
  }
  onActivePageChanged(changedPage: string) {
    this.setActivePageInLocalStorage(changedPage);
    this.activePage = changedPage;
    switch (changedPage) {
      case "stats":
        this.activePageTitle = "Stats & Trends";
        break;
      case "lineup":
        this.activePageTitle = "Defensive Lineup";
        break;
            case "batting-lineup":
        this.activePageTitle = "Batting Lineup";
        break;
            case "manage-team":
        this.activePageTitle = "Manage Team";
        break;
    }

  }
  setActivePageInLocalStorage(changedPage: string) {
    window.localStorage.setItem("activePage", changedPage);
  }
  getActivePageInLocalStorage() {
    const activePage = window.localStorage.getItem("activePage");
    if (activePage) {
      this.activePageService.activePage$.next(activePage);
    } else {
      this.activePageService.activePage$.next("stats");
    }
  }
}
