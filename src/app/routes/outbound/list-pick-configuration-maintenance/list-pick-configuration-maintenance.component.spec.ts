import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundListPickConfigurationMaintenanceComponent } from './list-pick-configuration-maintenance.component';

describe('OutboundListPickConfigurationMaintenanceComponent', () => {
  let component: OutboundListPickConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<OutboundListPickConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundListPickConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundListPickConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
