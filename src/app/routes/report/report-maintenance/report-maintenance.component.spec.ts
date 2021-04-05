import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportReportMaintenanceComponent } from './report-maintenance.component';

describe('ReportReportMaintenanceComponent', () => {
  let component: ReportReportMaintenanceComponent;
  let fixture: ComponentFixture<ReportReportMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReportMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReportMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
