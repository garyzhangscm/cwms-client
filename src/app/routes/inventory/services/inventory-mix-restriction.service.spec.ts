import { TestBed } from '@angular/core/testing';

import { InventoryMixRestrictionService } from './inventory-mix-restriction.service';

describe('InventoryMixRestrictionService', () => {
  let service: InventoryMixRestrictionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryMixRestrictionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
