import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderMrpMaintenanceComponent } from './mrp-maintenance.component';

describe('WorkOrderMrpMaintenanceComponent', () => {
  let component: WorkOrderMrpMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderMrpMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMrpMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMrpMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
