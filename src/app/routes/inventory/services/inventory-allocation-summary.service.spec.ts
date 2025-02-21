import { TestBed } from '@angular/core/testing';

import { InventoryAllocationSummaryService } from './inventory-allocation-summary.service';

describe('InventoryAllocationSummaryService', () => {
  let service: InventoryAllocationSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryAllocationSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
