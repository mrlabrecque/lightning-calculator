import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PitcherSelectionComponent } from './pitcher-selection.component';

describe('PitcherSelectionComponent', () => {
  let component: PitcherSelectionComponent;
  let fixture: ComponentFixture<PitcherSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PitcherSelectionComponent]
    });
    fixture = TestBed.createComponent(PitcherSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
