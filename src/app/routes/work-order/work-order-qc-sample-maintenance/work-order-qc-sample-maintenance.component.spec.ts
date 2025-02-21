import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderQcSampleMaintenanceComponent } from './work-order-qc-sample-maintenance.component';

describe('WorkOrderWorkOrderQcSampleMaintenanceComponent', () => {
  let component: WorkOrderWorkOrderQcSampleMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderQcSampleMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderQcSampleMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderQcSampleMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
