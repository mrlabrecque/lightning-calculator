import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTeamPlayerComponent } from './manage-team-player.component';

describe('ManageTeamPlayerComponent', () => {
  let component: ManageTeamPlayerComponent;
  let fixture: ComponentFixture<ManageTeamPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageTeamPlayerComponent]
    });
    fixture = TestBed.createComponent(ManageTeamPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
