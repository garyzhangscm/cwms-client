import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportReportHistoryComponent } from './report-history.component';

describe('ReportReportHistoryComponent', () => {
  let component: ReportReportHistoryComponent;
  let fixture: ComponentFixture<ReportReportHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReportHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReportHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
