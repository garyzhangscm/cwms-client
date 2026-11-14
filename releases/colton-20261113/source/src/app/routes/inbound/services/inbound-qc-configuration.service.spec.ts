import { TestBed } from '@angular/core/testing';

import { InboundQcConfigurationService } from './inbound-qc-configuration.service';

describe('InboundQcConfigurationService', () => {
  let service: InboundQcConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InboundQcConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
