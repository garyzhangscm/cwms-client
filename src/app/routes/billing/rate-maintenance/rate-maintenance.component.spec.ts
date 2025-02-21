import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingRateMaintenanceComponent } from './rate-maintenance.component';

describe('BillingRateMaintenanceComponent', () => {
  let component: BillingRateMaintenanceComponent;
  let fixture: ComponentFixture<BillingRateMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingRateMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingRateMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
