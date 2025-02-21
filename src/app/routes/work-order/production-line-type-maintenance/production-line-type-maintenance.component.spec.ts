import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineTypeMaintenanceComponent } from './production-line-type-maintenance.component';

describe('WorkOrderProductionLineTypeMaintenanceComponent', () => {
  let component: WorkOrderProductionLineTypeMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineTypeMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineTypeMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineTypeMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
