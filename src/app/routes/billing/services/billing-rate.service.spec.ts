import { TestBed } from '@angular/core/testing';

import { BillingRateService } from './billing-rate.service';

describe('BillingRateService', () => {
  let service: BillingRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillingRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
