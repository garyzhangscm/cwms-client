import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderCompleteKpiComponent } from './work-order-complete-kpi.component';

describe('WorkOrderWorkOrderCompleteKpiComponent', () => {
  let component: WorkOrderWorkOrderCompleteKpiComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderCompleteKpiComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderCompleteKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderCompleteKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
