import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTaskWorkTaskConfigurationMaintenanceComponent } from './work-task-configuration-maintenance.component';

describe('WorkTaskWorkTaskConfigurationMaintenanceComponent', () => {
  let component: WorkTaskWorkTaskConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<WorkTaskWorkTaskConfigurationMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkTaskWorkTaskConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkTaskWorkTaskConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
