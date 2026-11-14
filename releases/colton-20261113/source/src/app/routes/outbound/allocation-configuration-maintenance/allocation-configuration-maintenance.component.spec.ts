import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundAllocationConfigurationMaintenanceComponent } from './allocation-configuration-maintenance.component';

describe('OutboundAllocationConfigurationMaintenanceComponent', () => {
  let component: OutboundAllocationConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<OutboundAllocationConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundAllocationConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundAllocationConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
