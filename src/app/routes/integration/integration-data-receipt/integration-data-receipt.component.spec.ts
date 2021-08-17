import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IntegrationIntegrationDataReceiptComponent } from './integration-data-receipt.component';

describe('IntegrationIntegrationDataReceiptComponent', () => {
  let component: IntegrationIntegrationDataReceiptComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataReceiptComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataReceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
