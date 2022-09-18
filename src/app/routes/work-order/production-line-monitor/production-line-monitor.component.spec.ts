import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineMonitorComponent } from './production-line-monitor.component';

describe('WorkOrderProductionLineMonitorComponent', () => {
  let component: WorkOrderProductionLineMonitorComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
