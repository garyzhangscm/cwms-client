import { TestBed } from '@angular/core/testing';

import { AbcCategoryService } from './abc-category.service';

describe('AbcCategoryService', () => {
  let service: AbcCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbcCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
