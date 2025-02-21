import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderLineSparePartMaintenanceComponent } from './work-order-line-spare-part-maintenance.component';

describe('WorkOrderWorkOrderLineSparePartMaintenanceComponent', () => {
  let component: WorkOrderWorkOrderLineSparePartMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderLineSparePartMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderLineSparePartMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderLineSparePartMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
