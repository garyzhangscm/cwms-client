import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingInvoiceComponent } from './invoice.component';

describe('BillingInvoiceComponent', () => {
  let component: BillingInvoiceComponent;
  let fixture: ComponentFixture<BillingInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
