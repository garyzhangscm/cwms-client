import { TestBed } from '@angular/core/testing';

import { OrderActivityService } from './order-activity.service';

describe('OrderActivityService', () => {
  let service: OrderActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
