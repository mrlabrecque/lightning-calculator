import { TestBed } from '@angular/core/testing';

import { PositionRankingService } from './position-ranking.service';

describe('PositionRankingService', () => {
  let service: PositionRankingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PositionRankingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
