import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderLightMesStatusDashboardComponent } from './light-mes-status-dashboard.component';

describe('WorkOrderLightMesStatusDashboardComponent', () => {
  let component: WorkOrderLightMesStatusDashboardComponent;
  let fixture: ComponentFixture<WorkOrderLightMesStatusDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderLightMesStatusDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderLightMesStatusDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
