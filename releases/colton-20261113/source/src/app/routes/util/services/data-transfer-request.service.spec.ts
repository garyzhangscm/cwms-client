import { TestBed } from '@angular/core/testing';

import { DataTransferRequestService } from './data-transfer-request.service';

describe('DataTransferRequestService', () => {
  let service: DataTransferRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTransferRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
