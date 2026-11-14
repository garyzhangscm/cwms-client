import { TestBed } from '@angular/core/testing';

import { SiloConfigurationService } from './silo-configuration.service';

describe('SiloConfigurationService', () => {
  let service: SiloConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiloConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
