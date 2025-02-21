import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingBillableActivityTypeComponent } from './billable-activity-type.component';

describe('BillingBillableActivityTypeComponent', () => {
  let component: BillingBillableActivityTypeComponent;
  let fixture: ComponentFixture<BillingBillableActivityTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingBillableActivityTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingBillableActivityTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
