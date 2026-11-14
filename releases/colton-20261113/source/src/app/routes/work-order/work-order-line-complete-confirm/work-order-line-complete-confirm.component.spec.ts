import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderLineCompleteConfirmComponent } from './work-order-line-complete-confirm.component';

describe('WorkOrderWorkOrderLineCompleteConfirmComponent', () => {
  let component: WorkOrderWorkOrderLineCompleteConfirmComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderLineCompleteConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderLineCompleteConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderLineCompleteConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
