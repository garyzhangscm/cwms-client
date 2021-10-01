import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundInboundQcConfigurationMaintenanceComponent } from './inbound-qc-configuration-maintenance.component';

describe('InboundInboundQcConfigurationMaintenanceComponent', () => {
  let component: InboundInboundQcConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<InboundInboundQcConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundInboundQcConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundInboundQcConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
