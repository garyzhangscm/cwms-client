import { TestBed } from '@angular/core/testing';

import { CustomReportService } from './custom-report.service';

describe('CustomReportService', () => {
  let service: CustomReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
