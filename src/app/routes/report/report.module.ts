import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { CommonModule } from '../common/common.module';
import { ReportPrinterMaintenanceComponent } from './printer-maintenance/printer-maintenance.component';
import { ReportPrinterTypeMaintenanceComponent } from './printer-type-maintenance/printer-type-maintenance.component';
import { ReportPrinterTypeComponent } from './printer-type/printer-type.component';
import { ReportPrinterComponent } from './printer/printer.component';
import { ReportReportHistoryComponent } from './report-history/report-history.component';
import { ReportReportMaintenanceComponent } from './report-maintenance/report-maintenance.component';
import { ReportReportPreviewComponent } from './report-preview/report-preview.component';
import { ReportReportPrinterConfigurationMaintenanceComponent } from './report-printer-configuration-maintenance/report-printer-configuration-maintenance.component';
import { ReportReportPrinterConfigurationComponent } from './report-printer-configuration/report-printer-configuration.component';
import { ReportRoutingModule } from './report-routing.module';
import { ReportReportComponent } from './report/report.component';

const COMPONENTS: Array<Type<void>> = [
  ReportReportComponent,
  ReportReportHistoryComponent,
  ReportReportPreviewComponent,
  ReportReportMaintenanceComponent,
  ReportReportPrinterConfigurationComponent,
  ReportReportPrinterConfigurationMaintenanceComponent,
  ReportPrinterComponent,
  ReportPrinterMaintenanceComponent,
  ReportPrinterTypeComponent,
  ReportPrinterTypeMaintenanceComponent];

@NgModule({
  imports: [
    SharedModule,
    NzDescriptionsModule,
    ReportRoutingModule,
    PdfViewerModule,
    CommonModule,
    NzStepsModule
  ],
  declarations: COMPONENTS,
})
export class ReportModule { }
