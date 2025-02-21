import { TestBed } from '@angular/core/testing';

import { InventorySnapshotConfigurationService } from './inventory-snapshot-configuration.service';

describe('InventorySnapshotConfigurationService', () => {
  let service: InventorySnapshotConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventorySnapshotConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
