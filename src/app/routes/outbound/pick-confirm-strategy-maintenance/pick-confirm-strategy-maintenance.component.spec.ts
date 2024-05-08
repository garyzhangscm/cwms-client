import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundPickConfirmStrategyMaintenanceComponent } from './pick-confirm-strategy-maintenance.component';

describe('OutboundPickConfirmStrategyMaintenanceComponent', () => {
  let component: OutboundPickConfirmStrategyMaintenanceComponent;
  let fixture: ComponentFixture<OutboundPickConfirmStrategyMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundPickConfirmStrategyMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundPickConfirmStrategyMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
