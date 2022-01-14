import { TestBed } from '@angular/core/testing';

import { GanttTaskService } from './gantt-task.service';

describe('GanttTaskService', () => {
  let service: GanttTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GanttTaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
