import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportReportPreviewComponent } from './report-preview.component';

describe('ReportReportPreviewComponent', () => {
  let component: ReportReportPreviewComponent;
  let fixture: ComponentFixture<ReportReportPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportReportPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportReportPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
