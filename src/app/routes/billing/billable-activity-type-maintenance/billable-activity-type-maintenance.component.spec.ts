import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingBillableActivityTypeMaintenanceComponent } from './billable-activity-type-maintenance.component';

describe('BillingBillableActivityTypeMaintenanceComponent', () => {
  let component: BillingBillableActivityTypeMaintenanceComponent;
  let fixture: ComponentFixture<BillingBillableActivityTypeMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingBillableActivityTypeMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingBillableActivityTypeMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
