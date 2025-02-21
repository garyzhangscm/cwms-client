import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderDeassignProductionLineComponent } from './deassign-production-line.component';

describe('WorkOrderDeassignProductionLineComponent', () => {
  let component: WorkOrderDeassignProductionLineComponent;
  let fixture: ComponentFixture<WorkOrderDeassignProductionLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderDeassignProductionLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderDeassignProductionLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
