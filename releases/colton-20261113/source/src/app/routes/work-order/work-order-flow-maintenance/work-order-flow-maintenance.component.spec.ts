import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderFlowMaintenanceComponent } from './work-order-flow-maintenance.component';

describe('WorkOrderWorkOrderFlowMaintenanceComponent', () => {
  let component: WorkOrderWorkOrderFlowMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderFlowMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderFlowMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderFlowMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
