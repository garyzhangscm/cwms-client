import { TestBed } from '@angular/core/testing';

import { ProductionLineMonitorService } from './production-line-monitor.service';

describe('ProductionLineMonitorService', () => {
  let service: ProductionLineMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionLineMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
