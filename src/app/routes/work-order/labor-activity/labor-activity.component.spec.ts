import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderLaborActivityComponent } from './labor-activity.component';

describe('WorkOrderLaborActivityComponent', () => {
  let component: WorkOrderLaborActivityComponent;
  let fixture: ComponentFixture<WorkOrderLaborActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderLaborActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderLaborActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
