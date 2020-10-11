import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntegrationIntegrationDataReceiptComponent } from './integration-data-receipt.component';

describe('IntegrationIntegrationDataReceiptComponent', () => {
  let component: IntegrationIntegrationDataReceiptComponent;
  let fixture: ComponentFixture<IntegrationIntegrationDataReceiptComponent>;

  beforeEach(async(() => {
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
