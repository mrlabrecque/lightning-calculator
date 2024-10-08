import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute, Router, TitleStrategy } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';
import { LoaderService } from './services/loader.service';
import { TeamsService } from './services/teams.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})
export class AppComponent implements OnInit {
  get activePageTitle(): ActivatedRoute {
    let activePageTitle = this.activatedRoute;
    while (activePageTitle.firstChild) {
      activePageTitle = activePageTitle.firstChild;
    }
    return activePageTitle;
  }
  public loggedSessionSubscription: Subscription =
    this.authService.loggedSession$.subscribe((res) =>
      this.sessionChanged(res)
    );
  public title = 'Lightning-Calculator';
  public pageLoading = false;
  public showMenuBar = false;

  constructor(
    private teamService: TeamsService,
    private loaderService: LoaderService,
    private authService: AuthService,
    private titleStrategy: TitleStrategy,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.authService.getAuthenticatedUserOnAppReload();
    this.setAllTeams();
  }
  async setAllTeams() {
    this.teamService.setAllTeams();
  }
  sessionChanged(res: any) {
    this.showMenuBar = res ? true : false;
  }
}
