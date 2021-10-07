import { TestBed } from '@angular/core/testing';

import { QcRuleConfigurationService } from './qc-rule-configuration.service';

describe('QcRuleConfigurationService', () => {
  let service: QcRuleConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QcRuleConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
