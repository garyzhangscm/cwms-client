import { TestBed } from '@angular/core/testing';

import { InventoryConfigurationService } from './inventory-configuration.service';

describe('InventoryConfigurationService', () => {
  let service: InventoryConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
