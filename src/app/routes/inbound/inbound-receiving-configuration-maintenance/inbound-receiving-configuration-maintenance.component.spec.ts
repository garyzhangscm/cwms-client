import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundInboundReceivingConfigurationMaintenanceComponent } from './inbound-receiving-configuration-maintenance.component';

describe('InboundInboundReceivingConfigurationMaintenanceComponent', () => {
  let component: InboundInboundReceivingConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<InboundInboundReceivingConfigurationMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundInboundReceivingConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundInboundReceivingConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
