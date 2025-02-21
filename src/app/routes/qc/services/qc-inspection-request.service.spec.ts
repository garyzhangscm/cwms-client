import { TestBed } from '@angular/core/testing';

import { QcInspectionRequestService } from './qc-inspection-request.service';

describe('QcInspectionRequestService', () => {
  let service: QcInspectionRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QcInspectionRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
