import { TestBed } from '@angular/core/testing';

import { OrderDocumentService } from './order-document.service';

describe('OrderDocumentService', () => {
  let service: OrderDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
