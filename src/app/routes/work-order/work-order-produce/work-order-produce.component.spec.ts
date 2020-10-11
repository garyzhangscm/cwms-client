import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderProduceComponent } from './work-order-produce.component';

describe('WorkOrderWorkOrderProduceComponent', () => {
  let component: WorkOrderWorkOrderProduceComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderProduceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderProduceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderProduceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
