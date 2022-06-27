import { TestBed } from '@angular/core/testing';

import { WorkOrderLineSparePartService } from './work-order-line-spare-part.service';

describe('WorkOrderLineSparePartService', () => {
  let service: WorkOrderLineSparePartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderLineSparePartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
