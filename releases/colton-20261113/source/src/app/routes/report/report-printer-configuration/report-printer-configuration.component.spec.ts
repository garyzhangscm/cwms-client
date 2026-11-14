import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportReportPrinterConfigurationComponent } from './report-printer-configuration.component';

describe('ReportReportPrinterConfigurationComponent', () => {
  let component: ReportReportPrinterConfigurationComponent;
  let fixture: ComponentFixture<ReportReportPrinterConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReportPrinterConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReportPrinterConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
