import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderMouldComponent } from './mould.component';

describe('WorkOrderMouldComponent', () => {
  let component: WorkOrderMouldComponent;
  let fixture: ComponentFixture<WorkOrderMouldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMouldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMouldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
