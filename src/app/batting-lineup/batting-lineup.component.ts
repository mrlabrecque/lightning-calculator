import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Player } from '../models/player';
import { RosterService } from '../services/roster.service';

@Component({
  selector: 'app-batting-lineup',
  templateUrl: './batting-lineup.component.html',
  styleUrls: ['./batting-lineup.component.scss'],
})
export class BattingLineupComponent {
  currentRoster: Player[] = [];
  curretnRosterSubscription: Subscription =
    this.rosterSerive.currentRoster$.subscribe(
      (res) => (this.currentRoster = res)
    );
  displayedColumns: string[] = ['position', 'name', 'avg', 'slg', 'obp', 'ops'];
  buttonValue: string = 'normal';
  buttonOptions: any[] = [
    { label: 'Print', value: 'print' },
    { label: 'Normal', value: 'normal' },
    { label: 'Advanced', value: 'advanced' },
  ];
  constructor(private rosterSerive: RosterService) {}
  drop(event: CdkDragDrop<string>) {
    moveItemInArray(
      this.currentRoster,
      event.previousIndex,
      event.currentIndex
    );
  }
  getSeverity(number: number) {
    switch (true) {
      case number > 0.8:
        return 'success';
      case number > 0.6:
        return 'info';
      case number > 0.3:
        return 'warning';
      case number > 0.1:
        return 'danger';
      default:
        return 'danger';
    }
  }
}
