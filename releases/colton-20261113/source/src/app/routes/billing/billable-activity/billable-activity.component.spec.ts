import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingBillableActivityComponent } from './billable-activity.component';

describe('BillingBillableActivityComponent', () => {
  let component: BillingBillableActivityComponent;
  let fixture: ComponentFixture<BillingBillableActivityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingBillableActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingBillableActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
