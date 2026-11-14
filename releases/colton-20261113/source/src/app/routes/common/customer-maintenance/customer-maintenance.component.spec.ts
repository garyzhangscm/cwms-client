import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonCustomerMaintenanceComponent } from './customer-maintenance.component';

describe('CommonCustomerMaintenanceComponent', () => {
  let component: CommonCustomerMaintenanceComponent;
  let fixture: ComponentFixture<CommonCustomerMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonCustomerMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonCustomerMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
