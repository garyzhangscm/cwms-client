import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionPlanComponent } from './production-plan.component';

describe('WorkOrderProductionPlanComponent', () => {
  let component: WorkOrderProductionPlanComponent;
  let fixture: ComponentFixture<WorkOrderProductionPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
