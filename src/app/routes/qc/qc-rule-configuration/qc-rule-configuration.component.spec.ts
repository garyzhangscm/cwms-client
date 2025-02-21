import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcRuleConfigurationComponent } from './qc-rule-configuration.component';

describe('QcQcRuleConfigurationComponent', () => {
  let component: QcQcRuleConfigurationComponent;
  let fixture: ComponentFixture<QcQcRuleConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcRuleConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcRuleConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
