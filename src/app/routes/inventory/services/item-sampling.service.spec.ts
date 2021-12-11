import { TestBed } from '@angular/core/testing';

import { ItemSamplingService } from './item-sampling.service';

describe('ItemSamplingService', () => {
  let service: ItemSamplingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemSamplingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
