import { TestBed } from '@angular/core/testing';

import { WarehouseConfigurationService } from './warehouse-configuration.service';

describe('WarehouseConfigurationService', () => {
  let service: WarehouseConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
