import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { ReportRoutingModule } from './report-routing.module';
import { ReportReportComponent } from './report/report.component';
import { ReportReportHistoryComponent } from './report-history/report-history.component';
import { ReportReportPreviewComponent } from './report-preview/report-preview.component';
import { ReportReportMaintenanceComponent } from './report-maintenance/report-maintenance.component';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

import { PdfViewerModule } from 'ng2-pdf-viewer';

const COMPONENTS: Type<void>[] = [
  ReportReportComponent,
  ReportReportHistoryComponent,
  ReportReportPreviewComponent,
  ReportReportMaintenanceComponent];

@NgModule({
  imports: [
    SharedModule,
    NzDescriptionsModule,
    ReportRoutingModule,
    PdfViewerModule
  ],
  declarations: COMPONENTS,
})
export class ReportModule { }
