import { TestBed } from '@angular/core/testing';

import { WorkOrderQcRuleConfigurationService } from './work-order-qc-rule-configuration.service';

describe('WorkOrderQcRuleConfigurationService', () => {
  let service: WorkOrderQcRuleConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderQcRuleConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
