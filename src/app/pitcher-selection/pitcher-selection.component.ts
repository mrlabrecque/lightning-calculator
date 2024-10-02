import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pitcher-selection',
  templateUrl: './pitcher-selection.component.html',
  styleUrls: ['./pitcher-selection.component.scss'],
})
export class PitcherSelectionComponent {
  @Input() pitchers: any[] = [];
  @Input() disabled: boolean = false;
  @Output() pitcherChanged: EventEmitter<any> = new EventEmitter();
  selectedPitcher: any;

  onPitcherChange() {
    this.pitcherChanged.emit(this.selectedPitcher);
  }
}
