import { TestBed } from '@angular/core/testing';

import { RfService } from './rf.service';

describe('RfService', () => {
  let service: RfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
