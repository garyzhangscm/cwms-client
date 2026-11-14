import { TestBed } from '@angular/core/testing';

import { QuickbookService } from './quickbook.service';

describe('QuickbookService', () => {
  let service: QuickbookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickbookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
