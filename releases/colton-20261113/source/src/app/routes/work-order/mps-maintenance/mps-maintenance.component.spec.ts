import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderMpsMaintenanceComponent } from './mps-maintenance.component';

describe('WorkOrderMpsMaintenanceComponent', () => {
  let component: WorkOrderMpsMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderMpsMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMpsMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMpsMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
