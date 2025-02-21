import { TestBed } from '@angular/core/testing';

import { InventoryAgingSnapshotService } from './inventory-aging-snapshot.service';

describe('InventoryAgingSnapshotService', () => {
  let service: InventoryAgingSnapshotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryAgingSnapshotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
