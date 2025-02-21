import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingInvoiceMaintenanceComponent } from './invoice-maintenance.component';

describe('BillingInvoiceMaintenanceComponent', () => {
  let component: BillingInvoiceMaintenanceComponent;
  let fixture: ComponentFixture<BillingInvoiceMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingInvoiceMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingInvoiceMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
