import { TestBed } from '@angular/core/testing';

import { OutboundConfigurationService } from './outbound-configuration.service';

describe('OutboundConfigurationService', () => {
  let service: OutboundConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutboundConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
