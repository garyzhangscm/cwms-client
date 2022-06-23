import { TestBed } from '@angular/core/testing';

import { WebMessageAlertService } from './web-message-alert.service';

describe('WebMessageAlertService', () => {
  let service: WebMessageAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebMessageAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
