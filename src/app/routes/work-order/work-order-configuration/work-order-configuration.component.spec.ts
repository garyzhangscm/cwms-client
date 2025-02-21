import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderConfigurationComponent } from './work-order-configuration.component';

describe('WorkOrderWorkOrderConfigurationComponent', () => {
  let component: WorkOrderWorkOrderConfigurationComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
