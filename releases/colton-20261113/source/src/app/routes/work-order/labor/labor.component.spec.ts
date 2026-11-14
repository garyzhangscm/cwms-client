import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderLaborComponent } from './labor.component';

describe('WorkOrderLaborComponent', () => {
  let component: WorkOrderLaborComponent;
  let fixture: ComponentFixture<WorkOrderLaborComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderLaborComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderLaborComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
