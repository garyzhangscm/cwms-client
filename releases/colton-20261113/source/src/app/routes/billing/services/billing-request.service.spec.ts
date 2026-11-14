import { TestBed } from '@angular/core/testing';

import { BillingRequestService } from './billing-request.service';

describe('BillingRequestService', () => {
  let service: BillingRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillingRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
