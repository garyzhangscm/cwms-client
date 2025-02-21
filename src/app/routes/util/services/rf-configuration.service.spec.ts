import { TestBed } from '@angular/core/testing';

import { RfConfigurationService } from './rf-configuration.service';

describe('RfConfigurationService', () => {
  let service: RfConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
