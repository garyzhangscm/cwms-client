import { TestBed } from '@angular/core/testing';

import { QcConfigurationService } from './qc-configuration.service';

describe('QcConfigurationService', () => {
  let service: QcConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QcConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
