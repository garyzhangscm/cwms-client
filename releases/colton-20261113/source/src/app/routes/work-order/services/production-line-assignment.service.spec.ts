import { TestBed } from '@angular/core/testing';

import { ProductionLineAssignmentService } from './production-line-assignment.service';

describe('ProductionLineAssignmentService', () => {
  let service: ProductionLineAssignmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionLineAssignmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
