import { TestBed } from '@angular/core/testing';

import { LocationUtilizationSnapshotService } from './location-utilization-snapshot.service';

describe('LocationUtilizationSnapshotService', () => {
  let service: LocationUtilizationSnapshotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationUtilizationSnapshotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
