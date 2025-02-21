import { TestBed } from '@angular/core/testing';

import { EasyPostService } from './easy-post.service';

describe('EasyPostService', () => {
  let service: EasyPostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EasyPostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
