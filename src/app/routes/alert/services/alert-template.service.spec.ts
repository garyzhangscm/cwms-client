import { TestBed } from '@angular/core/testing';

import { AlertTemplateService } from './alert-template.service';

describe('AlertTemplateService', () => {
  let service: AlertTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
