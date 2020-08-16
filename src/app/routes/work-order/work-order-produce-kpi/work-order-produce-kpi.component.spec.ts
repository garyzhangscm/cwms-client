import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderProduceKpiComponent } from './work-order-produce-kpi.component';

describe('WorkOrderWorkOrderProduceKpiComponent', () => {
  let component: WorkOrderWorkOrderProduceKpiComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderProduceKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderProduceKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderProduceKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
