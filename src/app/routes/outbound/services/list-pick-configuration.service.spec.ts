import { TestBed } from '@angular/core/testing';

import { ListPickConfigurationService } from './list-pick-configuration.service';

describe('ListPickConfigurationService', () => {
  let service: ListPickConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListPickConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
