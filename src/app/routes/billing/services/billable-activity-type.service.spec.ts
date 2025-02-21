import { TestBed } from '@angular/core/testing';

import { BillableActivityTypeService } from './billable-activity-type.service';

describe('BillableActivityTypeService', () => {
  let service: BillableActivityTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillableActivityTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
