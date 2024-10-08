import { Component, EventEmitter, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivePageService } from '../services/active-page.service';


@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent {
  items: MenuItem[] | undefined;
  @Output() onPageClicked: EventEmitter<string> = new EventEmitter();
  constructor(private activePageService: ActivePageService) {
  }
    ngOnInit() {
        this.items = [
            {
              label: 'Stats & Tends',
              icon: 'pi pi-chart-line',
              command: () => this.onMenuItemClicked("stats")
            },
            {
              label: 'Defensive Lineup',
              icon: 'pi pi-list',
              command: () => this.onMenuItemClicked("lineup")
            } ,
            {
              label: 'Batting Lineup',
              icon: 'fa-solid fa-baseball-bat-ball',
              command: () => this.onMenuItemClicked("batting-lineup")
            },
            {
              label: 'Manage Team',
              icon: 'fa-solid fa-people-group',
              command: () => this.onMenuItemClicked("manage-team")
            }  
        ];
    }

  onMenuItemClicked(clickedPage: any) {
    this.activePageService.activePage$.next(clickedPage);
  }
}
