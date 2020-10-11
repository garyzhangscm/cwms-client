import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderCompleteComponent } from './work-order-complete.component';

describe('WorkOrderWorkOrderCompleteComponent', () => {
  let component: WorkOrderWorkOrderCompleteComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderCompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
