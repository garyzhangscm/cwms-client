import { TestBed } from '@angular/core/testing';

import { IntegrationDataService } from './integration-data.service';

describe('IntegrationDataService', () => {
  let service: IntegrationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
