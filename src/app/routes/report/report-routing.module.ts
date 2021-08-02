import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportReportComponent } from './report/report.component';
import { ReportReportHistoryComponent } from './report-history/report-history.component';
import { ReportReportPreviewComponent } from './report-preview/report-preview.component';
import { ReportReportMaintenanceComponent } from './report-maintenance/report-maintenance.component';
import { ReportReportPrinterConfigurationComponent } from './report-printer-configuration/report-printer-configuration.component';
import { ReportReportPrinterConfigurationMaintenanceComponent } from './report-printer-configuration-maintenance/report-printer-configuration-maintenance.component';

const routes: Routes = [

  { path: 'report', component: ReportReportComponent },
  { path: 'report-history', component: ReportReportHistoryComponent },
  { path: 'report-preview', component: ReportReportPreviewComponent },
  { path: 'report-maintenance', component: ReportReportMaintenanceComponent },
  { path: 'report-printer-configuration', component: ReportReportPrinterConfigurationComponent },
  { path: 'report-printer-configuration/maintenance', component: ReportReportPrinterConfigurationMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
