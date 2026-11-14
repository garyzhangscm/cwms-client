import { TestBed } from '@angular/core/testing';

import { LightMesConfigurationService } from './light-mes-configuration.service';

describe('LightMesConfigurationService', () => {
  let service: LightMesConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightMesConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
