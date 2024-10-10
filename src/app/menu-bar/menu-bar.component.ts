import { Component, EventEmitter, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TeamsService } from '../services/teams.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss'],
})
export class MenuBarComponent {
  @Output() clickedEmitter: EventEmitter<MenuItem> = new EventEmitter();
  items: MenuItem[] | undefined;
  loggedUser: any;
  loggedUserSubscription: Subscription = this.authService.loggedUser$.subscribe(
    (res) => (this.loggedUser = res)
  );
  currentTeam: any;
  currentTeamSubscription: Subscription =
    this.teamService.currentTeam$.subscribe((res) => (this.currentTeam = res));
  constructor(
    private authService: AuthService,
    private teamService: TeamsService
  ) {}
  ngOnInit() {
    this.items = [
      {
        label: 'Stats & Tends',
        icon: 'pi pi-chart-line',
        routerLink: '/stats',
      },
      {
        label: 'Defensive Lineup',
        icon: 'pi pi-list',
        routerLink: '/defensive-lineup',
      },
      {
        label: 'Batting Lineup',
        icon: 'fa-solid fa-baseball-bat-ball',
        routerLink: '/batting-lineup',
      },
      {
        label: 'Manage Team',
        icon: 'fa-solid fa-people-group',
        routerLink: '/manage-team',
      },
    ];
  }
  onMenuClick(itemClicked: MenuItem) {
    this.clickedEmitter.emit(itemClicked);
  }
  logoutClicked() {
    this.authService.onLogout();
  }
}
