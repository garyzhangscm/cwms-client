import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderMaintenanceComponent } from './work-order-maintenance.component';

describe('WorkOrderWorkOrderMaintenanceComponent', () => {
  let component: WorkOrderWorkOrderMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
