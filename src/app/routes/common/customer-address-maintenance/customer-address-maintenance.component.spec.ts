import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonCustomerAddressMaintenanceComponent } from './customer-address-maintenance.component';

describe('CommonCustomerAddressMaintenanceComponent', () => {
  let component: CommonCustomerAddressMaintenanceComponent;
  let fixture: ComponentFixture<CommonCustomerAddressMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonCustomerAddressMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonCustomerAddressMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
