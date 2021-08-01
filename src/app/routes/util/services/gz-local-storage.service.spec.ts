import { TestBed } from '@angular/core/testing';

import { GzLocalStorageService } from './gz-local-storage.service';

describe('GzLocalStorageService', () => {
  let service: GzLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GzLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
