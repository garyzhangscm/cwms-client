import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataReceiptConfirmComponent } from './integration-data-receipt-confirm.component';

describe('IntegrationIntegrationDataReceiptConfirmComponent', () => {
  let component: IntegrationIntegrationDataReceiptConfirmComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataReceiptConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrationIntegrationDataReceiptConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationIntegrationDataReceiptConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
