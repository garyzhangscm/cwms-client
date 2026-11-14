import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderQcInspectionOperationComponent } from './work-order-qc-inspection-operation.component';

describe('WorkOrderWorkOrderQcInspectionOperationComponent', () => {
  let component: WorkOrderWorkOrderQcInspectionOperationComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderQcInspectionOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderQcInspectionOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderQcInspectionOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
