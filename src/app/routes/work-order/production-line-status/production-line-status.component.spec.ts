import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineStatusComponent } from './production-line-status.component';

describe('WorkOrderProductionLineStatusComponent', () => {
  let component: WorkOrderProductionLineStatusComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
