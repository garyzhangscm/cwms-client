import { TestBed } from '@angular/core/testing';

import { WorkOrderQcResultService } from './work-order-qc-result.service';

describe('WorkOrderQcResultService', () => {
  let service: WorkOrderQcResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderQcResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
