import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance.component';

describe('WorkOrderQcRuleConfigurationMaintenanceComponent', () => {
  let component: WorkOrderQcRuleConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<WorkOrderQcRuleConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderQcRuleConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderQcRuleConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
