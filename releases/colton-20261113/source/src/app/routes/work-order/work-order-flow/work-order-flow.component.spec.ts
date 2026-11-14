import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderFlowComponent } from './work-order-flow.component';

describe('WorkOrderWorkOrderFlowComponent', () => {
  let component: WorkOrderWorkOrderFlowComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderFlowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
