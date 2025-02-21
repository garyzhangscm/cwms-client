import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance.component';

describe('QcQcRuleConfigurationMaintenanceComponent', () => {
  let component: QcQcRuleConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<QcQcRuleConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcRuleConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcRuleConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
