import { TestBed } from '@angular/core/testing';

import { ReportHistoryService } from './report-history.service';

describe('ReportHistoryService', () => {
  let service: ReportHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
