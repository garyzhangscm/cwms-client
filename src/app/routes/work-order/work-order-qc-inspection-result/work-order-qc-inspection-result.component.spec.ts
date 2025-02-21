import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderQcInspectionResultComponent } from './work-order-qc-inspection-result.component';

describe('WorkOrderWorkOrderQcInspectionResultComponent', () => {
  let component: WorkOrderWorkOrderQcInspectionResultComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderQcInspectionResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderQcInspectionResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderQcInspectionResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
