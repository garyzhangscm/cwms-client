import { TestBed } from '@angular/core/testing';

import { PickConfirmStrategyService } from './pick-confirm-strategy.service';

describe('PickConfirmStrategyService', () => {
  let service: PickConfirmStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PickConfirmStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
