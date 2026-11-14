import { TestBed } from '@angular/core/testing';

import { QcInspectionService } from './qc-inspection.service';

describe('QcInspectionService', () => {
  let service: QcInspectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QcInspectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
