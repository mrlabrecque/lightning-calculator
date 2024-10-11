import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BattingLineupComponent } from './batting-lineup.component';

describe('BattingLineupComponent', () => {
  let component: BattingLineupComponent;
  let fixture: ComponentFixture<BattingLineupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BattingLineupComponent]
    });
    fixture = TestBed.createComponent(BattingLineupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
