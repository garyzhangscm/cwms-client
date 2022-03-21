import { TestBed } from '@angular/core/testing';

import { CustomerReturnOrderLineService } from './customer-return-order-line.service';

describe('CustomerReturnOrderLineService', () => {
  let service: CustomerReturnOrderLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerReturnOrderLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
