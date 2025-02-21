import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertSubscriptionMaintenanceComponent } from './subscription-maintenance.component';

describe('AlertSubscriptionMaintenanceComponent', () => {
  let component: AlertSubscriptionMaintenanceComponent;
  let fixture: ComponentFixture<AlertSubscriptionMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertSubscriptionMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertSubscriptionMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
