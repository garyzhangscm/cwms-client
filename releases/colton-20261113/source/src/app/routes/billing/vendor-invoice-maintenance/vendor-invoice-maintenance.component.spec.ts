import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingVendorInvoiceMaintenanceComponent } from './vendor-invoice-maintenance.component';

describe('BillingVendorInvoiceMaintenanceComponent', () => {
  let component: BillingVendorInvoiceMaintenanceComponent;
  let fixture: ComponentFixture<BillingVendorInvoiceMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingVendorInvoiceMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingVendorInvoiceMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
