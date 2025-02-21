import { TestBed } from '@angular/core/testing';

import { RfAppVersionService } from './rf-app-version.service';

describe('RfAppVersionService', () => {
  let service: RfAppVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfAppVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
