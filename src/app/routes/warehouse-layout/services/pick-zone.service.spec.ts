import { TestBed } from '@angular/core/testing';

import { PickZoneService } from './pick-zone.service';

describe('PickZoneService', () => {
  let service: PickZoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PickZoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
