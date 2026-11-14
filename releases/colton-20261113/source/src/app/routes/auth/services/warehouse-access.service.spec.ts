import { TestBed } from '@angular/core/testing';

import { WarehouseAccessService } from './warehouse-access.service';

describe('WarehouseAccessService', () => {
  let service: WarehouseAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
