import { TestBed } from '@angular/core/testing';

import { ParcelPackageService } from './parcel-package.service';

describe('ParcelPackageService', () => {
  let service: ParcelPackageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParcelPackageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
