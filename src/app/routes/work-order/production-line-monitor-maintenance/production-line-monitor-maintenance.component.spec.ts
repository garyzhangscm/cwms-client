import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineMonitorMaintenanceComponent } from './production-line-monitor-maintenance.component';

describe('WorkOrderProductionLineMonitorMaintenanceComponent', () => {
  let component: WorkOrderProductionLineMonitorMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineMonitorMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineMonitorMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineMonitorMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
