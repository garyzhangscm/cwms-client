import { TestBed } from '@angular/core/testing';

import { IntegrationWorkOrderDataService } from './integration-work-order-data.service';

describe('IntegrationWorkOrderDataService', () => {
  let service: IntegrationWorkOrderDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationWorkOrderDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
