import { TestBed } from '@angular/core/testing';

import { WorkOrderFlowService } from './work-order-flow.service';

describe('WorkOrderFlowService', () => {
  let service: WorkOrderFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
