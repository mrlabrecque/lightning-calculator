import { TestBed } from '@angular/core/testing';

import { InningService } from './inning.service';

describe('InningService', () => {
  let service: InningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
