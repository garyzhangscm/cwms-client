import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderCompleteConfirmComponent } from './work-order-complete-confirm.component';

describe('WorkOrderWorkOrderCompleteConfirmComponent', () => {
  let component: WorkOrderWorkOrderCompleteConfirmComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderCompleteConfirmComponent>;

  beforeEach(async(() => {
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
