import { TestBed } from '@angular/core/testing';

import { WorkOrderLaborActivityHistoryService } from './work-order-labor-activity-history.service';

describe('WorkOrderLaborActivityHistoryService', () => {
  let service: WorkOrderLaborActivityHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderLaborActivityHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
