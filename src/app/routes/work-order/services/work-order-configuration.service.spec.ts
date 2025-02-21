import { TestBed } from '@angular/core/testing';

import { WorkOrderConfigurationService } from './work-order-configuration.service';

describe('WorkOrderConfigurationService', () => {
  let service: WorkOrderConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
