import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundCustomerReturnOrderMaintenanceComponent } from './customer-return-order-maintenance.component';

describe('InboundCustomerReturnOrderMaintenanceComponent', () => {
  let component: InboundCustomerReturnOrderMaintenanceComponent;
  let fixture: ComponentFixture<InboundCustomerReturnOrderMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundCustomerReturnOrderMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundCustomerReturnOrderMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
