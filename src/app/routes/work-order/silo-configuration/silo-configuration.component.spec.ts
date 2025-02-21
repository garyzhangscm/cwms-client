import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderSiloConfigurationComponent } from './silo-configuration.component';

describe('WorkOrderSiloConfigurationComponent', () => {
  let component: WorkOrderSiloConfigurationComponent;
  let fixture: ComponentFixture<WorkOrderSiloConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderSiloConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderSiloConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
