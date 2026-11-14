import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderLineCompleteComponent } from './work-order-line-complete.component';

describe('WorkOrderWorkOrderLineCompleteComponent', () => {
  let component: WorkOrderWorkOrderLineCompleteComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderLineCompleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderLineCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderLineCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
