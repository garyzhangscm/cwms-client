import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionKanbanComponent } from './production-kanban.component';

describe('WorkOrderProductionKanbanComponent', () => {
  let component: WorkOrderProductionKanbanComponent;
  let fixture: ComponentFixture<WorkOrderProductionKanbanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionKanbanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
