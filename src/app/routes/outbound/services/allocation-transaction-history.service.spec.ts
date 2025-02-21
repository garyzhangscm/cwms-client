import { TestBed } from '@angular/core/testing';

import { AllocationTransactionHistoryService } from './allocation-transaction-history.service';

describe('AllocationTransactionHistoryService', () => {
  let service: AllocationTransactionHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllocationTransactionHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
