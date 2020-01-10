import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonCustomerAddressMaintenanceComponent } from './customer-address-maintenance.component';

describe('CommonCustomerAddressMaintenanceComponent', () => {
  let component: CommonCustomerAddressMaintenanceComponent;
  let fixture: ComponentFixture<CommonCustomerAddressMaintenanceComponent>;

  beforeEach(async(() => {
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
