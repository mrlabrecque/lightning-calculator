import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivePageService } from './services/active-page.service';
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
  public activePage: string | undefined = "stats";
  public activePageTitle: string = "Home";
  public title = 'Lightning-Calculator';
  constructor(private activePageService: ActivePageService, private teamService: TeamsService) {
  }
  ngOnInit(): void {
    this.setAllTeams();
    this.activePageSubscription = this.activePageService.activePage$.subscribe((pageChanged: any) => this.onActivePageChanged(pageChanged));
  }
  async setAllTeams() {
    this.teamService.setAllTeams();
  }
  onActivePageChanged(changedPage: string) {
    this.activePage = changedPage;
    switch (changedPage) {
      case "stats":
        this.activePageTitle = "Stats & Trends";
        break;
      case "lineup":
        this.activePageTitle = "Defensive Lineup";
        break;
    }

  }
}



