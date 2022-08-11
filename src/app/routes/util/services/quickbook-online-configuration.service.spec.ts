import { TestBed } from '@angular/core/testing';

import { QuickbookOnlineConfigurationService } from './quickbook-online-configuration.service';

describe('QuickbookOnlineConfigurationService', () => {
  let service: QuickbookOnlineConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickbookOnlineConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
