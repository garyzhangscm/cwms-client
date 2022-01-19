import { TestBed } from '@angular/core/testing';

import { AlertSubscriptionService } from './alert-subscription.service';

describe('AlertSubscriptionService', () => {
  let service: AlertSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
