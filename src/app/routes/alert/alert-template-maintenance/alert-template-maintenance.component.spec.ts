import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertAlertTemplateMaintenanceComponent } from './alert-template-maintenance.component';

describe('AlertAlertTemplateMaintenanceComponent', () => {
  let component: AlertAlertTemplateMaintenanceComponent;
  let fixture: ComponentFixture<AlertAlertTemplateMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertAlertTemplateMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertAlertTemplateMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
