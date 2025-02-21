import { TestBed } from '@angular/core/testing';

import { InventorySnapshotService } from './inventory-snapshot.service';

describe('InventorySnapshotService', () => {
  let service: InventorySnapshotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySnapshotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
