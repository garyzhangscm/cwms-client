import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineDashboardComponent } from './production-line-dashboard.component';

describe('WorkOrderProductionLineDashboardComponent', () => {
  let component: WorkOrderProductionLineDashboardComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
