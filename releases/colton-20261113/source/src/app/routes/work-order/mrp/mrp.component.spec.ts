import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderMrpComponent } from './mrp.component';

describe('WorkOrderMrpComponent', () => {
  let component: WorkOrderMrpComponent;
  let fixture: ComponentFixture<WorkOrderMrpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMrpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
