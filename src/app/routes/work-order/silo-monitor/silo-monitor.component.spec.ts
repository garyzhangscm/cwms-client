import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderSiloMonitorComponent } from './silo-monitor.component';

describe('WorkOrderSiloMonitorComponent', () => {
  let component: WorkOrderSiloMonitorComponent;
  let fixture: ComponentFixture<WorkOrderSiloMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderSiloMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderSiloMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
