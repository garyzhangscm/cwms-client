import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WorkOrderWorkOrderCompleteConfirmComponent } from './work-order-complete-confirm.component';

describe('WorkOrderWorkOrderCompleteConfirmComponent', () => {
  let component: WorkOrderWorkOrderCompleteConfirmComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderCompleteConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderCompleteConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderCompleteConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
