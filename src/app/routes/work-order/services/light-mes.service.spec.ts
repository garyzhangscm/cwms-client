import { TestBed } from '@angular/core/testing';

import { LightMesService } from './light-mes.service';

describe('LightMesService', () => {
  let service: LightMesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LightMesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
