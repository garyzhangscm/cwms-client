import { TestBed } from '@angular/core/testing';

import { ReportPrinterConfigurationService } from './report-printer-configuration.service';

describe('ReportPrinterConfigurationService', () => {
  let service: ReportPrinterConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportPrinterConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
