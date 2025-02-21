import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderProductionPlanMaintenanceComponent } from './production-plan-maintenance.component';

describe('WorkOrderProductionPlanMaintenanceComponent', () => {
  let component: WorkOrderProductionPlanMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderProductionPlanMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionPlanMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionPlanMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
