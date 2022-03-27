import { TestBed } from '@angular/core/testing';

import { LocationUtilizationSnapshotBatchService } from './location-utilization-snapshot-batch.service';

describe('LocationUtilizationSnapshotBatchService', () => {
  let service: LocationUtilizationSnapshotBatchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationUtilizationSnapshotBatchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
