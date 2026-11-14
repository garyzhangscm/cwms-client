import { TestBed } from '@angular/core/testing';

import { QcRuleService } from './qc-rule.service';

describe('QcRuleService', () => {
  let service: QcRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QcRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
