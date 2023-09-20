import { TestBed } from '@angular/core/testing';

import { ProductionLineTypeService } from './production-line-type.service';

describe('ProductionLineTypeService', () => {
  let service: ProductionLineTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionLineTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
