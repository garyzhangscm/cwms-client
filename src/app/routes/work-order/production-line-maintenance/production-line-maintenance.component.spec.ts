import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineMaintenanceComponent } from './production-line-maintenance.component';

describe('WorkOrderProductionLineMaintenanceComponent', () => {
  let component: WorkOrderProductionLineMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
