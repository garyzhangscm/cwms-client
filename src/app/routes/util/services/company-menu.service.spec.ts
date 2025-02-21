import { TestBed } from '@angular/core/testing';

import { CompanyMenuService } from './company-menu.service';

describe('CompanyMenuService', () => {
  let service: CompanyMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
