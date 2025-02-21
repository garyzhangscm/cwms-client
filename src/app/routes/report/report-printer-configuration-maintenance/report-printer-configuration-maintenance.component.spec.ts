import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportReportPrinterConfigurationMaintenanceComponent } from './report-printer-configuration-maintenance.component';

describe('ReportReportPrinterConfigurationMaintenanceComponent', () => {
  let component: ReportReportPrinterConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<ReportReportPrinterConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReportPrinterConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReportPrinterConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
