import { TestBed } from '@angular/core/testing';

import { WorkOrderLineSparePartDetailService } from './work-order-line-spare-part-detail.service';

describe('WorkOrderLineSparePartDetailService', () => {
  let service: WorkOrderLineSparePartDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderLineSparePartDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
