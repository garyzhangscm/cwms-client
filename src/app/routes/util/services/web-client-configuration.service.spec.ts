import { TestBed } from '@angular/core/testing';

import { WebClientConfigurationService } from './web-client-configuration.service';

describe('WebClientConfigurationService', () => {
  let service: WebClientConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebClientConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
