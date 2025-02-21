import { TestBed } from '@angular/core/testing';

import { HualeiProductService } from './hualei-product.service';

describe('HualeiProductService', () => {
  let service: HualeiProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HualeiProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
