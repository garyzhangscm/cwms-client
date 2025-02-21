import { TestBed } from '@angular/core/testing';

import { PrinterTypeService } from './printer-type.service';

describe('PrinterTypeService', () => {
  let service: PrinterTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrinterTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
