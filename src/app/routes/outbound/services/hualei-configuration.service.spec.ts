import { TestBed } from '@angular/core/testing';

import { HualeiConfigurationService } from './hualei-configuration.service';

describe('HualeiConfigurationService', () => {
  let service: HualeiConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HualeiConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
