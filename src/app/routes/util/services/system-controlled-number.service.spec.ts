import { TestBed } from '@angular/core/testing';

import { SystemControlledNumberService } from './system-controlled-number.service';

describe('SystemControlledNumberService', () => {
  let service: SystemControlledNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemControlledNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
