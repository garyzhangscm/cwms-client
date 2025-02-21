import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderAssignProductionLineComponent } from './assign-production-line.component';

describe('WorkOrderAssignProductionLineComponent', () => {
  let component: WorkOrderAssignProductionLineComponent;
  let fixture: ComponentFixture<WorkOrderAssignProductionLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderAssignProductionLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderAssignProductionLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
