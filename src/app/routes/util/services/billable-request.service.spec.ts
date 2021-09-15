import { TestBed } from '@angular/core/testing';

import { BillableRequestService } from './billable-request.service';

describe('BillableRequestService', () => {
  let service: BillableRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillableRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
