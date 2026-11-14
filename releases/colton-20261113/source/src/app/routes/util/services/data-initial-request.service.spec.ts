import { TestBed } from '@angular/core/testing';

import { DataInitialRequestService } from './data-initial-request.service';

describe('DataInitialRequestService', () => {
  let service: DataInitialRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataInitialRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
