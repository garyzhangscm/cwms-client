import { TestBed } from '@angular/core/testing';

import { GanttLinkService } from './gantt-link.service';

describe('GanttLinkService', () => {
  let service: GanttLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GanttLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
