import { TestBed } from '@angular/core/testing';

import { WorkOrderLaborService } from './work-order-labor.service';

describe('WorkOrderLaborService', () => {
  let service: WorkOrderLaborService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderLaborService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
