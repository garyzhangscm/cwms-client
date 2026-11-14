import { TestBed } from '@angular/core/testing';

import { ArchiveConfigurationService } from './archive-configuration.service';

describe('ArchiveConfigurationService', () => {
  let service: ArchiveConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArchiveConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
