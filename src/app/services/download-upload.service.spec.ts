import { TestBed } from '@angular/core/testing';

import { DownloadUploadService } from './download-upload.service';

describe('DownloadUploadService', () => {
  let service: DownloadUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
