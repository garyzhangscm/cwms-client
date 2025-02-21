import { TestBed } from '@angular/core/testing';

import { InventoryLockService } from './inventory-lock.service';

describe('InventoryLockService', () => {
  let service: InventoryLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryLockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
