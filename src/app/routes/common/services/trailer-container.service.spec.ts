import { TestBed } from '@angular/core/testing';

import { TrailerContainerService } from './trailer-container.service';

describe('TrailerContainerService', () => {
  let service: TrailerContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrailerContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
