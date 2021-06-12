import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderMouldMaintenanceComponent } from './mould-maintenance.component';

describe('WorkOrderMouldMaintenanceComponent', () => {
  let component: WorkOrderMouldMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderMouldMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMouldMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMouldMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
