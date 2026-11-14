import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderLightMesConfigurationComponent } from './light-mes-configuration.component';

describe('WorkOrderLightMesConfigurationComponent', () => {
  let component: WorkOrderLightMesConfigurationComponent;
  let fixture: ComponentFixture<WorkOrderLightMesConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderLightMesConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderLightMesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
