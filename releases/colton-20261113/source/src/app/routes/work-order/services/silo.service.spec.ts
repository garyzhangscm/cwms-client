import { TestBed } from '@angular/core/testing';

import { SiloService } from './silo.service';

describe('SiloService', () => {
  let service: SiloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
