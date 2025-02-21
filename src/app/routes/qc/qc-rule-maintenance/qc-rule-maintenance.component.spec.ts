import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcRuleMaintenanceComponent } from './qc-rule-maintenance.component';

describe('QcQcRuleMaintenanceComponent', () => {
  let component: QcQcRuleMaintenanceComponent;
  let fixture: ComponentFixture<QcQcRuleMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcRuleMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcRuleMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
