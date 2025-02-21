import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineMonitorTransactionComponent } from './production-line-monitor-transaction.component';

describe('WorkOrderProductionLineMonitorTransactionComponent', () => {
  let component: WorkOrderProductionLineMonitorTransactionComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineMonitorTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineMonitorTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineMonitorTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
