import { TestBed } from '@angular/core/testing';

import { CustomerReturnOrderService } from './customer-return-order.service';

describe('CustomerReturnOrderService', () => {
  let service: CustomerReturnOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerReturnOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
