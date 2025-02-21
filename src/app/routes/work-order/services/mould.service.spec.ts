import { TestBed } from '@angular/core/testing';

import { MouldService } from './mould.service';

describe('MouldService', () => {
  let service: MouldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
