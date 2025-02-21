import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcRuleComponent } from './qc-rule.component';

describe('QcQcRuleComponent', () => {
  let component: QcQcRuleComponent;
  let fixture: ComponentFixture<QcQcRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
