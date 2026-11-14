import { TestBed } from '@angular/core/testing';

import { WorkOrderQcSampleService } from './work-order-qc-sample.service';

describe('WorkOrderQcSampleService', () => {
  let service: WorkOrderQcSampleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderQcSampleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
