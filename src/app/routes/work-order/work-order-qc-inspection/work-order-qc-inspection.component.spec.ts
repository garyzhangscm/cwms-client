import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderQcInspectionComponent } from './work-order-qc-inspection.component';

describe('WorkOrderWorkOrderQcInspectionComponent', () => {
  let component: WorkOrderWorkOrderQcInspectionComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderQcInspectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderQcInspectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderQcInspectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
