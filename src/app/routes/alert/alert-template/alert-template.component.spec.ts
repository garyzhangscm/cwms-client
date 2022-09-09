import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertAlertTemplateComponent } from './alert-template.component';

describe('AlertAlertTemplateComponent', () => {
  let component: AlertAlertTemplateComponent;
  let fixture: ComponentFixture<AlertAlertTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertAlertTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertAlertTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
