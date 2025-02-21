import { TestBed } from '@angular/core/testing';

import { MasterProductionScheduleService } from './master-production-schedule.service';

describe('MasterProductionScheduleService', () => {
  let service: MasterProductionScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterProductionScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
