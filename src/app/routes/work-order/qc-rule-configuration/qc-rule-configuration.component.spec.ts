import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderQcRuleConfigurationComponent } from './qc-rule-configuration.component';

describe('WorkOrderQcRuleConfigurationComponent', () => {
  let component: WorkOrderQcRuleConfigurationComponent;
  let fixture: ComponentFixture<WorkOrderQcRuleConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderQcRuleConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderQcRuleConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
