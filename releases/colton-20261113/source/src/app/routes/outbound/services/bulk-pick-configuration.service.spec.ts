import { TestBed } from '@angular/core/testing';

import { BulkPickConfigurationService } from './bulk-pick-configuration.service';

describe('BulkPickConfigurationService', () => {
  let service: BulkPickConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkPickConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
