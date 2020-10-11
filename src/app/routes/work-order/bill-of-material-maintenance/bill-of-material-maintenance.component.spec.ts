import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderBillOfMaterialMaintenanceComponent } from './bill-of-material-maintenance.component';

describe('WorkOrderBillOfMaterialMaintenanceComponent', () => {
  let component: WorkOrderBillOfMaterialMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderBillOfMaterialMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderBillOfMaterialMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderBillOfMaterialMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
