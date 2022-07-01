import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportPrinterMaintenanceComponent } from './printer-maintenance/printer-maintenance.component';
import { ReportPrinterTypeMaintenanceComponent } from './printer-type-maintenance/printer-type-maintenance.component';
import { ReportPrinterTypeComponent } from './printer-type/printer-type.component';
import { ReportPrinterComponent } from './printer/printer.component';
import { ReportReportHistoryComponent } from './report-history/report-history.component';
import { ReportReportMaintenanceComponent } from './report-maintenance/report-maintenance.component';
import { ReportReportPreviewComponent } from './report-preview/report-preview.component';
import { ReportReportPrinterConfigurationMaintenanceComponent } from './report-printer-configuration-maintenance/report-printer-configuration-maintenance.component';
import { ReportReportPrinterConfigurationComponent } from './report-printer-configuration/report-printer-configuration.component';
import { ReportReportComponent } from './report/report.component';

const routes: Routes = [

  { path: 'report', component: ReportReportComponent },
  { path: 'report-history', component: ReportReportHistoryComponent },
  { path: 'report-preview', component: ReportReportPreviewComponent },
  { path: 'report-maintenance', component: ReportReportMaintenanceComponent },
  { path: 'report-printer-configuration', component: ReportReportPrinterConfigurationComponent },
  { path: 'report-printer-configuration/maintenance', component: ReportReportPrinterConfigurationMaintenanceComponent },
  { path: 'printer', component: ReportPrinterComponent },
  { path: 'printer/maintenance', component: ReportPrinterMaintenanceComponent },
  { path: 'printer-type', component: ReportPrinterTypeComponent },
  { path: 'printer-type/maintenance', component: ReportPrinterTypeMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
