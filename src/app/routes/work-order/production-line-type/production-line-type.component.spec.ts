import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderProductionLineTypeComponent } from './production-line-type.component';

describe('WorkOrderProductionLineTypeComponent', () => {
  let component: WorkOrderProductionLineTypeComponent;
  let fixture: ComponentFixture<WorkOrderProductionLineTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderProductionLineTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderProductionLineTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
