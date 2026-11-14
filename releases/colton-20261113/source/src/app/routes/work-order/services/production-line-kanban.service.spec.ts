import { TestBed } from '@angular/core/testing';

import { ProductionLineKanbanService } from './production-line-kanban.service';

describe('ProductionLineKanbanService', () => {
  let service: ProductionLineKanbanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductionLineKanbanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
