import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderLineMaintenanceComponent } from './work-order-line-maintenance.component';

describe('WorkOrderWorkOrderLineMaintenanceComponent', () => {
  let component: WorkOrderWorkOrderLineMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderLineMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderLineMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderLineMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
