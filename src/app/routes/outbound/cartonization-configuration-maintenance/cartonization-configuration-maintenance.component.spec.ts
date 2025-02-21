import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundCartonizationConfigurationMaintenanceComponent } from './cartonization-configuration-maintenance.component';

describe('OutboundCartonizationConfigurationMaintenanceComponent', () => {
  let component: OutboundCartonizationConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<OutboundCartonizationConfigurationMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCartonizationConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCartonizationConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
