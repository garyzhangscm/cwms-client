import { TestBed } from '@angular/core/testing';

import { ProductionLineMonitorTransactionService } from './production-line-monitor-transaction.service';

describe('ProductionLineMonitorTransactionService', () => {
  let service: ProductionLineMonitorTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionLineMonitorTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
