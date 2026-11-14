import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTaskOperationTypeMaintenanceComponent } from './operation-type-maintenance.component';

describe('WorkTaskOperationTypeMaintenanceComponent', () => {
  let component: WorkTaskOperationTypeMaintenanceComponent;
  let fixture: ComponentFixture<WorkTaskOperationTypeMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkTaskOperationTypeMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkTaskOperationTypeMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
